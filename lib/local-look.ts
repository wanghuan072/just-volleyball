import { checkCode, crc32, unpackLook } from "./look-codec";
import { validateLockerInput } from "./locker-validation";
export type Look = Record<string, unknown>;
export async function encodeLocalLook(config: Look) {
  const plain = new TextEncoder().encode(
    JSON.stringify(validateLockerInput({ config }).config),
  );
  const zipped = new Uint8Array(
    await new Response(
      new Blob([plain]).stream().pipeThrough(new CompressionStream("deflate")),
    ).arrayBuffer(),
  );
  const bytes = new Uint8Array(zipped.length + 4);
  new DataView(bytes.buffer).setUint32(0, crc32(zipped));
  bytes.set(zipped, 4);
  return (
    "JV1:" + btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
  );
}
export async function decodeLocalLook(code: string): Promise<Look> {
  const checked = await checkCode(code);
  if (checked.status !== "notice") throw Error(checked.message);
  const match = /JV(1|2):([A-Za-z0-9_+/=-]+)/i.exec(code)!;
  const b64 = match[2].replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(
    atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)),
    (c) => c.charCodeAt(0),
  );
  if (match[1] === "2") return unpackLook(bytes.slice(2)).dictionary;
  return JSON.parse(
    await new Response(
      new Blob([bytes.slice(4)])
        .stream()
        .pipeThrough(new DecompressionStream("deflate")),
    ).text(),
  );
}
