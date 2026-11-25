import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { prepareManifest } from "./seo-manifest-lib.mjs";

const config = JSON.parse(await fs.readFile("seo/indexnow.json", "utf8"));
const records = JSON.parse(await fs.readFile("seo/page-dates.json", "utf8"));
let previous = JSON.parse(await fs.readFile("seo/production-baseline.json", "utf8"));
if (process.env.VERCEL_ENV === "production") {
  const response = await fetch(`${config.siteUrl}/seo-manifest.json`, {redirect:"error", signal:AbortSignal.timeout(15000), cache:"no-store"});
  const type = response.headers.get("content-type") ?? "";
  if (response.status === 200 && type.includes("application/json")) previous = await response.json();
  else if (!config.bootstrap || config.enabled || ![200,404].includes(response.status)) throw Error("Previous production manifest unavailable; refusing to discard production history");
  // bootstrap is explicit and only allowed while the first-send gate is closed.
}
const generatedAt = new Date().toISOString();
const candidate = {
  schemaVersion:1, fingerprintVersion:config.fingerprintVersion,
  siteUrl:config.siteUrl, generatedAt,
  entries:Object.entries(records).map(([path,record]) => ({path, canonicalUrl:new URL(path,config.siteUrl).href, indexable:true, contentFingerprint:record.fingerprint, lastModified:new Date(record.lastModified).toISOString()})).sort((a,b)=>a.canonicalUrl < b.canonicalUrl ? -1 : 1),
  deployment:{environment:process.env.VERCEL_ENV ?? "local", projectId:process.env.VERCEL_PROJECT_ID ?? null, commit:process.env.VERCEL_GIT_COMMIT_SHA ?? execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim()},
};
const current=prepareManifest(candidate,previous);
await fs.writeFile("public/seo-manifest.json",JSON.stringify(current,null,2)+"\n");
// The sitemap and page JSON-LD continue to consume the existing date file.
await fs.writeFile("seo/page-dates.json",JSON.stringify(Object.fromEntries(current.entries.map(e=>[e.path,{lastModified:e.lastModified,fingerprint:e.contentFingerprint}])),null,2)+"\n");
console.log(`Prepared ${current.entries.length} canonical URLs and ${current.deletedUrls.length} retained deletion events`);
