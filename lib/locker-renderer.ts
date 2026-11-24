import { spawn, type ChildProcess } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import type { LockerInput } from "./locker-validation";
import type { OrbitAtlas } from "./orbit-atlas";

const engineFolder = path.join(process.cwd(), "artifacts", "locker-engine");
const workFolder = path.join(process.cwd(), "artifacts", "locker-runtime");
type Setup = { engine: string; pack: string };
export type LockerResult = {
  config: Record<string, unknown>; code: string; image: string;
  requiredAccessories: string[]; missingAccessories: string[];
  width: number; height: number;
  rendererInfo: Record<string, unknown>;
  orbitAtlas?: OrbitAtlas;
};
export class LockerRenderError extends Error {
  constructor(message: string, readonly status = 503) { super(message); this.name = "LockerRenderError"; }
}
async function setup(): Promise<Setup> {
  let local: Partial<Setup> = {};
  try { local = JSON.parse(await readFile(path.join(engineFolder, "local-config.json"), "utf8")); } catch { /* optional local setup */ }
  const engine = process.env.JV_LOCKER_ENGINE || local.engine;
  const pack = process.env.JV_LOCKER_PACK || local.pack || path.join(engineFolder, "locker-render.pck");
  if (!engine) throw new LockerRenderError("The native Locker renderer has not been configured on this server.");
  // These are explicitly configured, external native-runtime files. They are
  // provisioned by prepare.py, not traced into a Next.js server bundle.
  try { await Promise.all([access(/* turbopackIgnore: true */ engine), access(/* turbopackIgnore: true */ pack)]); }
  catch { throw new LockerRenderError("The native Locker engine or prepared resource pack is unavailable on this server."); }
  return {engine, pack};
}
export async function lockerAvailability() {
  try { await setup(); return {available:true, message:"Game 1.0.3 native appearance renderer is ready."}; }
  catch (error) { return {available:false, message:error instanceof Error ? error.message : "Renderer unavailable."}; }
}

// A bounded subprocess reuses the portrait rig during a burst of requests.
// Native jobs are serialized to protect the shared rig and bound GPU work.
let tail: Promise<unknown> = Promise.resolve();
let pending = 0;
const cache = new Map<string, LockerResult>();
const inFlight = new Map<string, Promise<LockerResult>>();
let worker: PreviewWorker | null = null;
export async function renderLocker(input: LockerInput): Promise<LockerResult> {
  const runtime = await setup();
  const version = (await stat(/* turbopackIgnore: true */ runtime.pack)).mtimeMs;
  const runtimeKey = JSON.stringify([runtime.engine, runtime.pack, version]);
  const key = createHash("sha256").update(JSON.stringify([runtimeKey, input])).digest("hex");
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const running = inFlight.get(key);
  if (running) return running;
  if (pending >= 3) return Promise.reject(new LockerRenderError("The renderer is busy. Please wait for the current preview and try again.", 429));
  pending++;
  const task = tail.catch(() => undefined).then(() => execute(input, runtime, runtimeKey));
  tail = task;
  inFlight.set(key, task);
  void task.then(result => {
    if (cache.size >= 48) cache.delete(cache.keys().next().value!);
    cache.set(key, result);
  }).catch(() => undefined).finally(() => { pending--; inFlight.delete(key); });
  return task;
}
class WorkerClosed extends LockerRenderError {}

class PreviewWorker {
  private frame: { finish: () => void; fail: (error: Error) => void } | null = null;
  private capable = false;
  private exited = false;
  private reading = false;
  private usedAt = 0;
  private readonly spawnedAt = Date.now();
  private readonly closed: Promise<void>;

  constructor(readonly key: string, private readonly folder: string, private readonly child: ChildProcess) {
    const lines = createInterface({ input: child.stdout! });
    lines.on("line", line => {
      if (line === "LOCKER_PREVIEW_WORKER") this.capable = true;
      if (line === "LOCKER_RENDER_COMPLETE") this.frame?.finish();
      if (line.startsWith("LOCKER_ERROR=")) {
        this.frame?.fail(line.includes("cannot be decoded")
          ? new LockerRenderError("The game rejected this appearance code. Check that it is complete and valid.", 400)
          : new LockerRenderError("The native renderer could not finish this appearance.", 422));
      }
    });
    child.stderr?.resume();
    child.on("error", () => this.frame?.fail(new WorkerClosed("The native renderer could not start.")));
    this.closed = new Promise(resolve => child.once("close", () => {
      this.exited = true;
      lines.close();
      this.frame?.fail(new WorkerClosed("The native renderer closed before the preview finished."));
      if (!this.reading) this.clean();
      resolve();
    }));
  }

  private clean() {
    void rm(this.folder, { recursive: true, force: true }).catch(() => undefined);
  }

  reusable(key: string) {
    const now = Date.now();
    return this.capable && !this.exited && this.key === key &&
      now - this.usedAt < 6000 && now - this.spawnedAt < 50000;
  }

  async stop() {
    if (!this.exited) this.child.kill();
    await this.closed;
  }

  async render(input?: LockerInput): Promise<LockerResult> {
    if (this.exited) throw new WorkerClosed("The native renderer has already closed.");
    this.reading = true;
    const completed = new Promise<void>((resolve, reject) => {
      const end = () => {
        clearTimeout(timeout);
        this.frame = null;
      };
      const timeout = setTimeout(() => {
        this.frame?.fail(new LockerRenderError("The player preview timed out. Please try again.", 504));
        this.child.kill();
      }, 25000);
      this.frame = {
        finish: () => { end(); resolve(); },
        fail: error => { end(); reject(error); },
      };
    });
    try {
      await Promise.all([completed, input ? this.send(input) : undefined]);
      const [metadata, image] = await Promise.all([
        readFile(path.join(this.folder, "result.json"), "utf8"),
        readFile(path.join(this.folder, "portrait.png")),
      ]);
      if (!image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        throw new LockerRenderError("The native portrait is not a PNG.", 422);
      }
      const result = { ...JSON.parse(metadata), image: `data:image/png;base64,${image.toString("base64")}` } as LockerResult;
      if (result.orbitAtlas) {
        const atlas = await readFile(path.join(this.folder, "orbit.webp"));
        result.orbitAtlas.image = `data:image/webp;base64,${atlas.toString("base64")}`;
      }
      this.usedAt = Date.now();
      return result;
    } finally {
      this.reading = false;
      if (this.exited) this.clean();
    }
  }

  private async send(input: LockerInput) {
    const temporary = path.join(this.folder, "next.tmp");
    try {
      await writeFile(temporary, JSON.stringify(input));
      await rename(temporary, path.join(this.folder, "next.json"));
    } catch {
      throw new WorkerClosed("The native renderer could not accept the next preview.");
    }
  }
}

async function execute(input: LockerInput, runtime: Setup, key: string): Promise<LockerResult> {
  if (worker?.reusable(key)) {
    try { return await worker.render(input); }
    catch (error) {
      await worker.stop();
      worker = null;
      if (!(error instanceof WorkerClosed)) throw error;
    }
  }
  await worker?.stop();
  worker = null;
  await mkdir(workFolder, { recursive: true });
  const folder = path.join(workFolder, randomUUID());
  await mkdir(folder);
  try {
    const request = path.join(folder, "request.json");
    await writeFile(request, JSON.stringify({ ...input, previewWorker: true }));
    const child = spawn(/* turbopackIgnore: true */ runtime.engine, [
      "--main-pack", runtime.pack, "--rendering-method", "gl_compatibility", "--rendering-driver", "opengl3",
      "--audio-driver", "Dummy", "--position", "-32000,-32000", "--resolution", "960x1240",
      "--max-fps", "60", "--", request,
    ], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    worker = new PreviewWorker(key, folder, child);
    return await worker.render();
  } catch (error) {
    await worker?.stop();
    worker = null;
    await rm(folder, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}
