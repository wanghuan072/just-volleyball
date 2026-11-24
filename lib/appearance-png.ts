/** Metadata-only import matching LookShare.PNG_KEY. This does not decode QR images. */
export const MAX_APPEARANCE_PNG_BYTES = 8 * 1024 * 1024;
const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const MAX_CODE_LENGTH = 16384 + 4;
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
type ParsedPng = {code?: string; chunks: {type: string; start: number; end: number; appearance: boolean}[]};
function validateCode(code: string) {
  if (code.length > MAX_CODE_LENGTH) throw Error("PNG appearance code exceeds the game's size limit.");
  if (!/^JV(?:2:[A-Za-z0-9_-]+|1:[A-Za-z0-9+/]+=*)$/i.test(code)) throw Error("PNG contains an invalid appearance code.");
}
function parsePng(bytes: Uint8Array): ParsedPng {
  if (bytes.length > MAX_APPEARANCE_PNG_BYTES) throw Error("PNG exceeds the 8 MB import limit.");
  if (bytes.length < 8 || !SIGNATURE.every((v, i) => bytes[i] === v)) throw Error("Select an original PNG player card, not a JPEG or screenshot.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = new TextDecoder("ascii");
  let pos = 8, count = 0, ended = false, code: string | undefined;
  const chunks: ParsedPng["chunks"] = [];
  while (pos < bytes.length) {
    if (++count > 10000) throw Error("PNG contains too many chunks.");
    if (bytes.length - pos < 12) throw Error("PNG is truncated: incomplete chunk header.");
    const size = view.getUint32(pos, false);
    if (size > bytes.length - pos - 12) throw Error("PNG is truncated: chunk exceeds file bounds.");
    const type = ascii.decode(bytes.subarray(pos + 4, pos + 8));
    if (!/^[A-Za-z]{4}$/.test(type)) throw Error("PNG contains an invalid chunk type.");
    if (count === 1 && (type !== "IHDR" || size !== 13)) throw Error("PNG is missing its image header.");
    if (count > 1 && type === "IHDR") throw Error("PNG contains duplicate image headers.");
    // Check every chunk, including the jvlook tEXt chunk; never import damaged metadata.
    if (crc32(bytes.subarray(pos + 4, pos + 8 + size)) !== view.getUint32(pos + 8 + size, false)) throw Error(`PNG ${type} checksum is invalid. Export the player card again.`);
    let appearance = false;
    if (type === "tEXt") {
      const data = bytes.subarray(pos + 8, pos + 8 + size);
      const nul = data.indexOf(0);
      if (nul >= 0 && nul <= 79 && ascii.decode(data.subarray(0, nul)) === "jvlook") {
        appearance = true;
        if (code !== undefined) throw Error("PNG contains multiple appearance codes; export a fresh player card.");
        const text = data.subarray(nul + 1);
        if (text.length > MAX_CODE_LENGTH) throw Error("PNG appearance code exceeds the game's size limit.");
        if (text.some(byte => byte > 127)) throw Error("PNG appearance code contains invalid characters.");
        code = ascii.decode(text);
        validateCode(code);
      }
    }
    chunks.push({type, start: pos, end: pos + size + 12, appearance});
    pos += size + 12;
    if (type === "IEND") {
      if (size !== 0 || pos !== bytes.length) throw Error("PNG has an invalid end marker or trailing data.");
      ended = true;
      break;
    }
  }
  if (!ended) throw Error("PNG is truncated: missing end marker.");
  return {code, chunks};
}
export function extractAppearanceCodeFromPng(bytes: Uint8Array): string {
  const {code} = parsePng(bytes);
  if (!code) throw Error("No embedded appearance code found. Import an original game-exported PNG player card; QR-only pictures and screenshots are not supported.");
  return code;
}

/** Add the game's jvlook text chunk before IEND, replacing existing appearance metadata. */
export function embedAppearanceCodeInPng(bytes: Uint8Array, code: string): Uint8Array {
  validateCode(code);
  const {chunks} = parsePng(bytes);
  const typed = new TextEncoder().encode(`tEXtjvlook\0${code}`);
  const chunk = new Uint8Array(typed.length + 8);
  const chunkView = new DataView(chunk.buffer);
  chunkView.setUint32(0, typed.length - 4, false);
  chunk.set(typed, 4);
  chunkView.setUint32(chunk.length - 4, crc32(typed), false);
  const retained = chunks.filter(item => !item.appearance);
  const length = 8 + chunk.length + retained.reduce((total, item) => total + item.end - item.start, 0);
  if (length > MAX_APPEARANCE_PNG_BYTES) throw Error("PNG with appearance metadata exceeds the 8 MB import limit.");
  const output = new Uint8Array(length);
  output.set(bytes.subarray(0, 8));
  let offset = 8;
  for (const item of retained) {
    if (item.type === "IEND") { output.set(chunk, offset); offset += chunk.length; }
    output.set(bytes.subarray(item.start, item.end), offset);
    offset += item.end - item.start;
  }
  return output;
}
