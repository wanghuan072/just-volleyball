import fs from "node:fs";
import path from "node:path";
const catalog = JSON.parse(fs.readFileSync("data/locker-catalog.json", "utf8"));
const root = "public/models/locker";
fs.mkdirSync(root, { recursive: true });
const jobs = [];
const index = {
  body: "/models/locker/body.glb",
  hair: {},
  beard: {},
  accessories: {},
};
function add(name, config, part) {
  jobs.push({
    config: { ...catalog.defaults, ...config },
    part,
    output: path.resolve(root, name + ".glb").replaceAll("\\", "/"),
  });
  return "/models/locker/" + name + ".glb";
}
add("body", { hair: "", fh: "" }, "body");
index.gym = add("gym", { hair: "", fh: "" }, "body");
jobs.at(-1).outfit = "gym";
for (const item of catalog.hair) {
  if (item.id)
    index.hair[item.id] = add("hair-" + item.id, { hair: item.id }, "hair");
}
for (const item of catalog.facialHair) {
  if (item.id)
    index.beard[item.id] = add("beard-" + item.id, { fh: item.id }, "beard");
}
for (const item of catalog.accessories) {
  if (item.availableInBuild === false) continue;
  index.accessories[item.id] = add(
    "accessory-" + item.id,
    { hair: "", acc: { [item.category]: { id: item.id } } },
    "accessory",
  );
}
fs.mkdirSync("artifacts/locker-web", { recursive: true });
fs.writeFileSync(
  "artifacts/locker-web/export.json",
  JSON.stringify({ web_export: true, jobs }),
);
fs.writeFileSync(root + "/index.json", JSON.stringify(index, null, 2) + "\n");
console.log(`Prepared ${jobs.length} original-model exports`);
