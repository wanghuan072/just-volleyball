import { connection } from "next/server";
import { lockerAvailability, LockerRenderError, renderLocker } from "@/lib/locker-renderer";
import { LockerValidationError, MAX_LOCKER_BYTES, validateLockerInput } from "@/lib/locker-validation";

export async function GET() {
  await connection();
  return Response.json(await lockerAvailability(),{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({error:"Cross-origin rendering is not allowed."},{status:403});
    if (Number(request.headers.get("content-length")) > MAX_LOCKER_BYTES) return Response.json({error:"Configuration exceeds 128 KB."},{status:413});
    // Bound chunked bodies too, before parsing or spawning the engine.
    const reader = request.body?.getReader();
    if (!reader) throw new LockerValidationError("Expected a JSON request body.");
    const chunks: Uint8Array[] = [];
    let size=0;
    while (true) {
      const {done,value}=await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size>MAX_LOCKER_BYTES) { await reader.cancel(); return Response.json({error:"Configuration exceeds 128 KB."},{status:413}); }
      chunks.push(value);
    }
    const body=Buffer.concat(chunks);
    let parsed: unknown;
    try { parsed=JSON.parse(body.toString("utf8")); }
    catch { throw new LockerValidationError("The configuration is not valid JSON."); }
    return Response.json(await renderLocker(validateLockerInput(parsed)),{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    const status=error instanceof LockerValidationError || error instanceof LockerRenderError ? error.status : 500;
    return Response.json({error:error instanceof Error ? error.message : "The preview could not be rendered."},{status,headers:{"Cache-Control":"no-store"}});
  }
}
