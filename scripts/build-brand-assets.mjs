import sharp from "sharp";
import { writeFile, readFile, mkdir } from "node:fs/promises";

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect x="8" y="8" width="240" height="240" rx="64" fill="#1254e9" stroke="#fff" stroke-width="12"/><circle cx="128" cy="128" r="91" fill="#ffda40" stroke="#142654" stroke-width="8"/><path d="M50 82 Q117 46 167 75 Q145 111 113 130 Q75 124 42 145 M167 75 Q207 100 216 142 Q178 167 136 159 Q113 130 113 130 M136 159 Q125 191 91 211 M113 130 Q94 88 102 42" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/><path d="M50 82 Q117 46 167 75 Q145 111 113 130 Q75 124 42 145 M167 75 Q207 100 216 142 Q178 167 136 159 M136 159 Q125 191 91 211 M113 130 Q94 88 102 42" fill="none" stroke="#1254e9" stroke-width="8" stroke-linecap="round"/></svg>`;
await mkdir("public/images", { recursive: true });
await writeFile("public/images/logo.svg", logo);
await sharp(Buffer.from(logo)).resize(256).png().toFile("public/images/logo.png");
await sharp(Buffer.from(logo)).resize(192).png().toFile("public/icon.png");
await sharp(Buffer.from(logo)).resize(180).png().toFile("public/apple-icon.png");
const sizes = [16, 32, 48, 64];
const pictures = await Promise.all(sizes.map(size => sharp(Buffer.from(logo)).resize(size).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const start = 6 + i * 16;
  header[start] = size; header[start + 1] = size;
  header.writeUInt16LE(1, start + 4); header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(pictures[i].length, start + 8); header.writeUInt32LE(offset, start + 12);
  offset += pictures[i].length;
});
await writeFile("app/favicon.ico", Buffer.concat([header, ...pictures]));
const photo = await sharp(await readFile("public/images/game/character-match.jpg")).resize(565, 500, { fit: "cover" }).png().toBuffer();
const base = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffda40"/><path d="M0 570L1200 80M0 370L900 0" stroke="#fff4" stroke-width="28"/><rect x="32" y="32" width="1136" height="566" rx="36" fill="#fffdf3" stroke="#fff" stroke-width="8"/><path d="M1120 598H70" stroke="#1254e9" stroke-width="9"/><g fill="#142654" font-family="Arial,sans-serif" font-weight="900"><text x="70" y="227" font-size="67">Just</text><text x="70" y="303" font-size="67">Volleyball</text></g><g fill="#455570" font-family="Arial,sans-serif" font-size="24"><text x="72" y="366">Skins. Codes. Your next rally.</text><text x="72" y="411">Create a look in the Locker.</text><text x="72" y="448">Learn the game. Play with friends.</text></g><rect x="70" y="493" width="350" height="50" rx="16" fill="#1254e9"/><text x="94" y="527" font-family="Arial,sans-serif" font-size="24" fill="#fff" font-weight="700">justvolleyball.app</text></svg>`;
const mark=await sharp(Buffer.from(logo)).resize(88).png().toBuffer();
await sharp(Buffer.from(base)).composite([{ input:photo,left:595,top:65 },{input:mark,left:70,top:67}]).png().toFile("public/images/og-image.png");
console.log("Created logo, icon, favicon and 1200×630 share image.");
