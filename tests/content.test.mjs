import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
const root = process.cwd();
const modules = new Map();
function load(file) {
  const resolved = path.resolve(root, file);
  if (modules.has(resolved)) return modules.get(resolved);
  if (resolved.endsWith(".json"))
    return JSON.parse(readFileSync(resolved, "utf8"));
  const source = readFileSync(resolved, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  modules.set(resolved, loadedModule.exports);
  const require = (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "next/cache") return { cacheLife() {} };
    let target = specifier.startsWith("@/")
      ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(resolved), specifier);
    if (!path.extname(target)) target += ".ts";
    return load(target);
  };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename: resolved,
  })(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const { checkCode } = load("lib/check-code.ts");
const { catalog: publishedCatalog } = load("lib/catalog.ts");
const skins = load("data/skins.json");
// Filtering fixtures retain source identity; publication is checked separately.
const catalog = (query, category = "") =>
  publishedCatalog(query, category, skins, 4);
const updates = load("data/updates.json");

test("production prerender works offline without calling Steam", async () => {
  const previousFetch = globalThis.fetch;
  const previousPhase = process.env.NEXT_PHASE;
  let calls = 0;
  try {
    process.env.NEXT_PHASE = "phase-production-build";
    globalThis.fetch = async () => { calls++; throw new Error("Network unavailable"); };
    const { getPlayers, getPrice } = load("lib/steam.ts");
    const { getNews } = load("lib/news.ts");
    assert.equal((await getPlayers()).cached, true);
    assert.equal((await getPrice()).cached, true);
    const news = await getNews();
    assert.equal(news.cached, true);
    assert.ok(news.items.length > 0);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousPhase === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = previousPhase;
  }
});

test("search results are noindex, real categories indexable, and pagination has a stable canonical", async () => {
  const { listMetadata } = load("lib/list-metadata.ts");
  const filtered = await listMetadata(
    "Skins",
    "Library",
    "/skins/",
    Promise.resolve({ q: "hinata" }),
  );
  assert.equal(filtered.robots.index, false);
  assert.equal(
    filtered.alternates.canonical,
    "https://justvolleyball.app/skins/",
  );
  const page = await listMetadata(
    "Skins",
    "Library",
    "/skins/",
    Promise.resolve({ page: "2" }),
  );
  assert.equal(page.robots.index, true);
  assert.equal(page.alternates.canonical, "https://justvolleyball.app/skins/?page=2");
  const category = await listMetadata(
    "Anime",
    "Library",
    "/skins/anime/",
    Promise.resolve({}),
    "anime",
  );
  assert.equal(category.robots.index, true);
});
test("publication distinguishes package checks from independent game tests", async () => {
  const content = load("lib/content.ts");
  assert.equal(content.skins.length, 50);
  assert.equal(publishedCatalog({}).total, 50);
  const { pages: pageCount } = publishedCatalog({});
  const pages = Array.from({ length: pageCount }, (_, index) => publishedCatalog({ page: String(index + 1) }).items);
  assert.deepEqual(pages.map(items => items.length), [20, 20, 10]);
  assert.equal(new Set(pages.flat().map(skin => skin.id)).size, 50);
  assert.equal(publishedCatalog({ category: "pokemon" }).total > 0, true);
  for (const skin of content.skins) {
    assert.ok(skin.evidence.crcValid && skin.evidence.resourceMatch);
    assert.equal(skin.evidence.gameTested, false);
    assert.equal(skin.render.rendered,true);
    assert.equal(skin.render.gameImportTested,false);
    assert.equal(skin.verified, false);
    assert.equal(content.findSkin(skin.slug).id, skin.id);
    assert.equal(skin.sourceUrl, `https://jvlocker.com/s/${skin.id}`);
    assert.ok(skin.tags.length);
    assert.equal((await checkCode(skin.code)).status, "notice");
  }
  const sitemap = load("app/sitemap.ts").default();
  assert.ok(sitemap.some(item=>item.url.endsWith("/skins/hinata/")));
  assert.ok(sitemap.some(item=>item.url.endsWith("/customization/")));
  assert.ok(!sitemap.some(item=>item.url.endsWith("/character-codes/")));
});

test("each published portrait is an exact-code recovered-game render, not a crowd or third-party image", () => {
  const content=load("lib/content.ts");
  for(const skin of content.skins){
    assert.match(skin.image,/^\/images\/players\/[a-z0-9-]+\.png$/);
    assert.equal(skin.render.codeSha256,createHash("sha256").update(skin.code).digest("hex"));
    assert.equal(skin.render.imageSha256,createHash("sha256").update(readFileSync(path.join(root,"public",skin.image))).digest("hex"));
    assert.equal(skin.render.width,960);assert.equal(skin.render.height,1240);
    const [left,top,right,bottom]=skin.render.alphaBounds;
    assert.ok(Math.min(left,top,960-right,1240-bottom)>=16);
    assert.match(skin.render.modelPath,/player_char\.blend$/);
  }
});

test("Steam data distinguishes zero users, malformed data and failures; prices require USD", async () => {
  const previousFetch = globalThis.fetch;
  const { getPlayers, getPrice } = load("lib/steam.ts");
  try {
    globalThis.fetch = async () =>
      Response.json({ response: { result: 1, player_count: 0 } });
    assert.equal((await getPlayers()).count, 0);
    globalThis.fetch = async () =>
      Response.json({ response: { result: 1, player_count: -1 } });
    assert.equal((await getPlayers()).count, null);
    globalThis.fetch = async () => {
      throw new Error("Timeout");
    };
    const failed = await getPlayers(5401090);
    assert.equal(failed.count, null);
    assert.equal(failed.fetchedAt, null);
    globalThis.fetch = async () =>
      Response.json({
        5037200: {
          success: true,
          data: { price_overview: { currency: "EUR", final: 999 } },
        },
      });
    assert.equal((await getPrice()).price, null);
    globalThis.fetch = async () =>
      Response.json({
        5037200: {
          success: true,
          data: {
            price_overview: {
              currency: "USD",
              final: 999,
              initial: 999,
              discount_percent: 0,
              final_formatted: "$9.99",
              initial_formatted: "$9.99",
            },
          },
        },
      });
    const price = await getPrice();
    assert.equal(price.price.currency, "USD");
    assert.ok(price.fetchedAt);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
test("real JV2 codes decode to independently extracted hair, jersey and accessory IDs", async () => {
  const expected = load("data/preset-evidence.json");
  for (const skin of skins) {
    const result=await checkCode(skin.code);
    assert.equal(result.status,"notice",`${skin.slug}: ${result.message}`);
    assert.equal(result.revision,expected[skin.slug].codecRevision);
    assert.equal(result.look.hair,expected[skin.slug].decoded.hairId);
    assert.equal(result.look.number,expected[skin.slug].decoded.jerseyNumber);
    assert.deepEqual([...result.look.accessories].sort(),expected[skin.slug].requiredAccessories.map(a=>a.id).sort());
    assert.equal(result.look.unknownResources.length,0);
    assert.match(result.message,/does not test in-game/);
  }
});
test("code decoder rejects damage, truncation and unsupported revisions, not just bad prefixes", async () => {
  const {crc32}=load("lib/look-codec.ts");
  const wrap=(payload)=>{const check=crc32(payload)&65535;return "JV2:"+Buffer.concat([Buffer.from([check>>8,check&255]),payload]).toString("base64url");};
  assert.equal((await checkCode("")).status,"empty");
  assert.equal((await checkCode("not a code")).status,"error");
  assert.equal((await checkCode("JV2:")).status,"error");
  const bytes=Buffer.from(skins[0].code.slice(4),"base64url");bytes[5]^=1;
  assert.match((await checkCode("JV2:"+bytes.toString("base64url"))).message,/Checksum/);
  assert.equal((await checkCode(wrap(Buffer.from([0])))).status,"error");
  assert.match((await checkCode(wrap(Buffer.from([0xc4])))).message,/Newer format/);
  assert.equal((await checkCode("JV2:"+"a".repeat(16385))).status,"error");
});
test("legacy JV1 uses checksum plus bounded DEFLATE JSON decoding", async () => {
  const {crc32}=load("lib/look-codec.ts");
  function v1(value){const payload=deflateSync(JSON.stringify(value));const check=Buffer.alloc(4);check.writeUInt32BE(crc32(payload));return "JV1:"+Buffer.concat([check,payload]).toString("base64");}
  const code=v1({hair:"kage",num:9,acc:{}});
  const result=await checkCode(code);
  assert.equal(result.status,"notice",result.message);
  assert.equal(result.format,"JV1");assert.equal(result.look.hair,"kage");assert.equal(result.look.number,9);
  assert.equal((await checkCode(v1([]))).status,"error");
  assert.match((await checkCode(v1({extra:"x".repeat(70000)}))).message,/size limit/);
});
test("combined catalog search and category, no matches and alphabetic sorting", () => {
  assert.equal(
    catalog({ q: "HINATA", category: "haikyuu" }).items[0].slug,
    "hinata",
  );
  assert.equal(catalog({ q: "hinata", category: "games" }).total, 0);
  assert.equal(catalog({ q: "not-a-preset" }).total, 0);
  const sorted = catalog({ sort: "name" }).items.map((s) => s.name);
  assert.deepEqual(
    [...sorted],
    [...sorted].sort((a, b) => a.localeCompare(b)),
  );
  assert.equal(catalog({}, "anime").total, skins.length);
});
test("pagination clamps malformed bounds and resets when filtering removes the previous page", () => {
  assert.equal(catalog({ page: "-20" }).page, 1);
  assert.equal(catalog({ page: "999" }).page, 2);
  assert.equal(catalog({ page: "2", q: "hinata" }).page, 1);
  assert.equal(catalog({ page: "invalid" }).page, 1);
  const first = catalog({ page: "1" }).items;
  const second = catalog({ page: "2" }).items;
  assert.equal(first.length + second.length, skins.length);
  assert.ok(!first.some((a) => second.some((b) => a.id === b.id)));
});
test("community source previews remain archived and are not publicly served", () => {
  assert.equal(new Set(skins.map((s) => s.slug)).size, skins.length);
  for (const s of skins) {
    assert.match(s.sourceUrl, /^https:\/\/jvlocker.com\/s\/\d+$/);
    assert.match(s.code, /^JV2:[A-Za-z0-9_-]+$/);
    assert.ok(s.code.length > 50);
    assert.equal(s.creator, null);
    assert.equal(s.sourceAccount, "@community");
    assert.equal(s.sourceVerified, true);
    assert.equal(s.verificationStatus, "code-matched-render-import-untested");
    assert.equal(s.verified, false);
    assert.ok(s.rightsNote);
    assert.ok(
      existsSync(
        path.join(root, "artifacts/quarantined-skins", path.basename(s.image)),
      ),
    );
    assert.ok(!existsSync(path.join(root,"public",s.image)));
  }
});
test("audited code and preview digests retain the reviewed source records without asserting import validity", () => {
  const audit = load("data/content-audit.json");
  assert.equal(audit.skinChecks.length, skins.length);
  for (const skin of skins) {
    const evidence = audit.skinChecks.find((e) => e.slug === skin.slug);
    assert.ok(evidence);
    assert.equal(
      evidence.codeSha256,
      createHash("sha256").update(skin.code).digest("hex"),
    );
    assert.equal(
      evidence.localPreviewSha256,
      createHash("sha256")
        .update(
          readFileSync(
            path.join(
              root,
              "artifacts/quarantined-skins",
              path.basename(skin.image),
            ),
          ),
        )
        .digest("hex"),
    );
    assert.equal(evidence.gameImportTested, false);
    assert.equal(evidence.originalCreator, null);
  }
});
test("updates have stable unique slugs, dated original sources and no invented future publication", () => {
  assert.equal(new Set(updates.map((u) => u.slug)).size, updates.length);
  for (const u of updates) {
    assert.ok(Number.isFinite(Date.parse(u.publishedAt)));
    assert.ok(Date.parse(u.publishedAt) <= Date.parse(u.updatedAt));
    assert.match(u.sourceUrl, /^https:/);
    assert.ok(u.content.length);
    assert.ok(u.summary);
  }
});
test("all guide related links resolve and guide sources are named", () => {
  const { guides } = load("data/guides.ts");
  const slugs = new Set(guides.map((g) => g.slug));
  for (const g of guides) {
    assert.ok(g.sources.length);
    assert.ok(g.status);
    for (const slug of g.related) assert.ok(slugs.has(slug));
  }
});

test("package catalogs keep resource counts, menu availability and ownership distinct", () => {
  const assets=load("data/extracted-assets.json");
  for(const group of assets.groups){
    assert.equal(group.count,group.items.length);
    assert.equal(new Set(group.items.map(i=>i.id)).size,group.count);
    for(const item of group.items) if(item.image) assert.ok(existsSync(path.join(root,"public",item.image)));
  }
  assert.equal(assets.studioStickers.items.length,4);
  assert.ok(assets.groups.find(g=>g.id==="stickers").items.every(i=>i.image===null));
  assert.equal(assets.accessories.items.filter(i=>i.supporter).length,4);
  assert.ok(assets.accessories.items.filter(i=>!i.supporter).every(i=>i.price===1000));
  const gameplay=load("data/package-gameplay.json");
  assert.equal(gameplay.rules.maxLocalPlayers,4);
  assert.equal(gameplay.controls.find(c=>c.action==="strafe").key,"Shift");
  assert.equal(gameplay.controls.find(c=>c.action==="sprint").key,"Ctrl");
});

test("published character PNGs are original packaged crowd art with exact identity", () => {
  const art=load("data/game-character-art.json");
  assert.equal(art.count,200);assert.equal(art.items.length,200);
  assert.equal(new Set(art.items.map(i=>i.id)).size,200);
  for(const item of art.items){
    assert.match(item.sourcePath,/^game\/crowd\/portraits\/fan_\d{3}\.png$/);
    assert.match(item.role,/not an importable player preset/);
    assert.equal(createHash("sha256").update(readFileSync(path.join(root,"public",item.image))).digest("hex"),item.sha256);
  }
});
