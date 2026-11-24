import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
const panels = [0, 120, 240]
  .map(
    (angle) =>
      `<g transform="rotate(${angle} 32 32)"><path d="M32 4C17 11 13 27 18 43L31 48C24 31 30 17 44 7Z" fill="#1454e8"/><path d="M44 7C31 18 27 31 32 43L41 44C35 28 42 17 51 12Z" fill="#ffd747"/></g>`,
  )
  .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="white"/>${panels}<circle cx="32" cy="32" r="29" fill="none" stroke="#102352" stroke-width="3"/></svg>`;
await mkdir("public/images/ui", { recursive: true });
await writeFile("public/images/ui/logo.svg", svg);
for (const [name, size] of [
  ["public/images/ui/logo.png", 512],
  ["public/icon.png", 192],
  ["public/apple-icon.png", 180],
])
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(name);
const png = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile("app/favicon.ico", Buffer.concat([header, png]));
await writeFile("public/favicon.ico", Buffer.concat([header, png]));
