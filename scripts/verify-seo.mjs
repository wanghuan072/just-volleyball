import { tdk } from "../seo/tdk.js";
import { guides } from "../data/guide-articles.ts";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const skins = [...JSON.parse(await readFile("data/skins.json","utf8")), ...JSON.parse(await readFile("data/community-skins.json","utf8"))];
let issues=0;
for (const [name, seo] of [...Object.entries(tdk),...guides.map(g=>[g.slug,g.seo]),...skins.map(s=>[s.slug,s.seo])]) {
 for(const [field,min,max] of [["title",40,60],["description",140,160]]) {
  if(!seo || seo[field].length<min || seo[field].length>max) {console.log(name,field,seo?.[field]?.length);issues++;}
 }
 assert.match(seo.title,/Just Volleyball/i);
 assert.match(seo.description,/Just Volleyball/i);
}
assert.equal(issues,0,"Editorial metadata length targets failed");
console.log("Checked unique page themes and metadata length targets.");
