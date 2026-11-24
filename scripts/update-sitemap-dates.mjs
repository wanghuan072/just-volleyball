import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tdk } from "../seo/tdk.js";
import { guides } from "../data/guide-articles.ts";

const json = async file => JSON.parse(await readFile(file, "utf8"));
const skins = [...await json("data/skins.json"), ...await json("data/community-skins.json")];
const evidence = await json("data/preset-evidence.json");
const renders = await json("data/portrait-renders.json");
const published = skins.filter(skin => evidence[skin.slug]?.crcValid && evidence[skin.slug]?.resourceMatch && renders.items.some(item => item.slug === skin.slug));
const legal = await json("data/legal.json");
let old = {};
try { old = await json("seo/page-dates.json"); } catch { /* First content baseline. */ }
const today = new Date().toISOString().slice(0, 10);
const records = {};
async function record(url, file, content) {
  const page = await readFile(file, "utf8");
  // Visible content can change in a shared component or image without changing
  // the route file. Keep these dependencies local to the affected page family.
  const dependencies = ["app/layout.tsx", "components/chrome.tsx", "components/shared.tsx"];
  if (url === "/" || url.startsWith("/skins/")) dependencies.push("components/portrait-image.tsx");
  if (url.startsWith("/skins/")) dependencies.push("components/catalog.tsx");
  if (url === "/tools/locker/") dependencies.push("components/locker-studio.tsx", "components/preview-orbit.tsx", "lib/orbit-atlas.ts");
  if (url === "/characters/shop/") dependencies.push("components/shop-catalog.tsx", "components/preview-orbit.tsx", "lib/orbit-atlas.ts");
  const sources = await Promise.all(dependencies.map(path => readFile(path, "utf8")));
  const input = JSON.stringify([page, content, sources]);
  const images = [...new Set(input.match(/\/images\/[a-zA-Z0-9_./-]+\.(?:png|jpg|jpeg|webp|svg)/g) ?? [])].sort();
  const assetHashes = await Promise.all(images.map(async image => {
    try { return [image, createHash("sha256").update(await readFile("public" + image)).digest("hex")]; }
    catch (error) {
      // Archived source fields can name unpublished assets; restored files must
      // still alter the fingerprint. Published references are checked by verify:build.
      if (error.code === "ENOENT") return [image, "unpublished"];
      throw error;
    }
  }));
  const fingerprint = createHash("sha256").update(JSON.stringify([input, assetHashes])).digest("hex");
  records[url] = { lastModified: old[url]?.fingerprint === fingerprint ? old[url].lastModified : today, fingerprint };
}
for (const [url, seo] of Object.entries(tdk)) {
  let file = url === "/" ? "app/page.tsx" : "app" + url + "page.tsx";
  let content = seo;
  if (url.startsWith("/legal/")) {
    file = "app/legal/[slug]/page.tsx";
    content = [seo, legal[url.split("/")[2]]];
  }
  if (["/price/", "/discord/", "/mobile/"].includes(url)) file = "app/[slug]/page.tsx";
  if (["/skins/anime/", "/skins/haikyuu/"].includes(url)) file = "app/skins/[slug]/page.tsx";
  if (url === "/") content = [content, published.slice(0, 6), guides.map(({ slug, shortTitle, description, icon }) => ({ slug, shortTitle, description, icon })), (await json("data/updates.json")).slice(0, 3)];
  if (url === "/skins/") content = [content, published];
  if (url === "/skins/anime/" || url === "/skins/haikyuu/") {
    const tag = url.split("/")[2];
    content = [content, published.filter(skin => skin.tags.some(value => value.toLowerCase() === tag))];
  }
  if (url === "/guides/") content = [content, guides.map(guide => ({ slug: guide.slug, title: guide.title, description: guide.description, image: guide.image, category: guide.category }))];
  if (url === "/updates/") content = [content, await json("data/updates.json")];
  if (url === "/characters/shop/") content = [content, await json("data/shop-catalog.json")];
  if (url === "/characters/" || url === "/tools/locker/") content = [content, await json("data/locker-catalog.json")];
  if (url === "/customization/") content = [content, await json("data/extracted-assets.json")];
  if (url === "/characters/spectators/") content = [content, await json("data/game-character-art.json")];
  await record(url, file, content);
}
for (const guide of guides) await record("/guides/" + guide.slug + "/", "app/guides/[slug]/page.tsx", guide);
for (const skin of published) await record("/skins/" + skin.slug + "/", "app/skins/[slug]/page.tsx", [skin, evidence[skin.slug], renders.items.find(item => item.slug === skin.slug)]);
await writeFile("seo/page-dates.json", JSON.stringify(records, null, 2) + "\n");
console.log("Tracked meaningful content dates for", Object.keys(records).length, "canonical pages.");
