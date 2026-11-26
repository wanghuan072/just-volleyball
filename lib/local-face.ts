import type { Look } from "./local-look";
type Part = {
  base?: string;
  tint?: string;
  line?: string;
  lash?: string;
  center: number[];
  right: number[];
  left: number[];
  both: boolean;
};
type Parts = Record<string, Part[]>;
let parts: Promise<Parts> | undefined;
const images = new Map<string, Promise<HTMLImageElement>>();
const n = (c: Look, k: string, d = 0.5) =>
  typeof c[k] === "number" ? Number(c[k]) : d;
const col = (c: Look, k: string, d: string) =>
  "#" + String(c[k] ?? d).replace(/^#/, "");
function load(url: string) {
  let p = images.get(url);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(Error("Could not load face part"));
      image.src = url;
    });
    images.set(url, p);
  }
  return p;
}
async function layer(url: string, tint?: string) {
  const image = await load(url);
  if (!tint) return image;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const c = canvas.getContext("2d")!;
  c.drawImage(image, 0, 0);
  c.globalCompositeOperation = "source-in";
  c.fillStyle = tint;
  c.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}
export async function paintFace(config: Look) {
  parts ??= fetch("/models/locker/faces/index.json").then((r) => {
    if (!r.ok) throw Error("Missing original face assets");
    return r.json();
  });
  const catalog = await parts;
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(64, 64);
  if (config.bl) {
    const p = catalog.blush?.[Number(config.blsh ?? 0)];
    ctx.fillStyle = col(config, "blc", "f58585");
    ctx.globalAlpha = 0.12 + 0.8 * n(config, "bo");
    const tilt = (n(config, "blr") - 0.5) * Math.PI * 0.5;
    if (p?.base) {
      const image = await layer(p.base, col(config, "blc", "f58585"));
      for (const right of [true, false]) {
        const pivot = right ? p.right : p.left;
        const x = pivot[0] * 256,
          y = pivot[1] * 512;
        ctx.save();
        ctx.translate(
          (right ? 256 : 0) +
            x +
            (right ? 1 : -1) * (n(config, "bx") - 0.5) * 220,
          y + (n(config, "bhy") - 0.5) * 260,
        );
        ctx.rotate(right ? tilt : -tilt);
        ctx.scale(
          1 + (n(config, "bw") - 0.5) * 0.9,
          1 + (n(config, "bz") - 0.5) * 0.9,
        );
        ctx.drawImage(
          image,
          right ? image.width / 2 : 0,
          0,
          image.width / 2,
          image.height,
          -x,
          -y,
          256,
          512,
        );
        ctx.restore();
      }
    } else {
      const scale = (v: number) => (18 + (105 - 18) * v) / 61.5;
      for (const right of [true, false]) {
        ctx.save();
        ctx.translate(
          256 + (right ? 1 : -1) * (512 * 0.24 - 40 + 155 * n(config, "bx")),
          512 * 0.7 + (n(config, "bhy") - 0.5) * 260,
        );
        ctx.rotate(right ? tilt : -tilt);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          52 * 1.6 * scale(n(config, "bw")),
          52 * scale(n(config, "bz")),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
  async function pair(
    kind: string,
    index: number,
    width: number,
    height: number,
    gap: number,
    dy: number,
    dx: number,
    rot: number,
    tint?: string,
  ) {
    const p = catalog[kind]?.[index];
    if (!p) return;
    const sequence: [string | undefined, string | undefined][] =
      kind === "brows"
        ? [[p.base, tint]]
        : p.line
          ? [
              [p.line, undefined],
              [p.tint, col(config, "eyc", "211a14")],
              [p.lash, col(config, "elc", "000000")],
            ]
          : [
              [p.tint, col(config, "eyc", "211a14")],
              [p.base, undefined],
            ];
    for (const [url, color] of sequence) {
      if (!url) continue;
      const image = await layer(url, color);
      for (const right of [true, false]) {
        const own = kind === "eyes" && p.both;
        const center = right
          ? p.right
          : own
            ? p.left
            : [1 - p.right[0], p.right[1]];
        const pivot = [center[0] * 256, center[1] * 512];
        const old = [
          right
            ? 512 * (kind === "eyes" ? 0.115 : 0.13)
            : 256 - 512 * (kind === "eyes" ? 0.115 : 0.13),
          512 * (kind === "eyes" ? 0.45 : 0.27),
        ];
        const correction = kind === "eyes" ? -0.1 : 0;
        ctx.save();
        ctx.translate(
          (right ? 256 : 0) +
            (right ? gap : -gap) +
            dx +
            (old[0] - pivot[0]) * correction +
            pivot[0],
          dy + (old[1] - pivot[1]) * correction + pivot[1],
        );
        ctx.rotate(right ? rot : -rot);
        ctx.scale(width, height);
        ctx.translate(-pivot[0], -pivot[1]);
        if (!right && !own) {
          ctx.translate(256, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(
          image,
          right || !own ? image.width / 2 : 0,
          0,
          image.width / 2,
          image.height,
          0,
          0,
          256,
          512,
        );
        ctx.restore();
      }
    }
  }
  await pair(
    "brows",
    n(config, "bs", 0),
    0.65 + 0.7 * n(config, "bwid"),
    0.65 + 0.7 * n(config, "bht"),
    -55 + 160 * n(config, "bsp"),
    -(n(config, "bh") - 0.5) * 360,
    (n(config, "bpx") - 0.5) * 270,
    (n(config, "br") - 0.5) * Math.PI,
    col(config, "bwc", "000000"),
  );
  await pair(
    "eyes",
    n(config, "es", 0),
    0.6 + n(config, "ew"),
    0.6 + n(config, "eyz"),
    -70 + 190 * n(config, "ex"),
    -(n(config, "eh") - 0.5) * 390,
    (n(config, "epx") - 0.5) * 270,
    (n(config, "er") - 0.5) * Math.PI,
  );
  for (const [
    kind,
    index,
    xkey,
    ykey,
    wkey,
    hkey,
    rkey,
    baseY,
    rangeX,
    rangeY,
    baseScale,
  ] of [
    ["nose", "ns", "nx", "nh", "nw", "ny", "", "290", 240, 345, 1.05],
    ["mouth", "ms", "mpx", "mh", "mw", "my", "mr", "345", 270, 300, 1.1],
  ] as const) {
    const p = catalog[kind]?.[n(config, index, kind === "nose" ? 0 : 1)];
    if (!p?.base) continue;
    const image = await layer(p.base);
    const pivot = [p.center[0] * 512, p.center[1] * 512];
    ctx.save();
    ctx.translate(
      (n(config, xkey) - 0.5) * rangeX +
        (256 - pivot[0]) * (1 - baseScale) +
        pivot[0],
      -(n(config, ykey) - 0.5) * rangeY +
        (Number(baseY) - pivot[1]) * (1 - baseScale) +
        pivot[1],
    );
    ctx.rotate(rkey ? (n(config, rkey) - 0.5) * Math.PI : 0);
    ctx.scale(
      (kind === "nose" ? 0.55 : 0.6) + n(config, wkey),
      (kind === "nose" ? 0.55 : 0.6) + n(config, hkey),
    );
    if (kind === "nose" && config.nfl) ctx.scale(-1, 1);
    ctx.translate(-pivot[0], -pivot[1]);
    ctx.drawImage(image, 0, 0, 512, 512);
    ctx.restore();
  }
  return canvas;
}
