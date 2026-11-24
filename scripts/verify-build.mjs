import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";
const base = ".next/server/app";
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(path.join(dir, entry.name))
      : [path.join(dir, entry.name)],
  );
}
const htmlFiles = files(base).filter(
  (f) =>
    f.endsWith(".html") &&
    !f.includes("[") &&
    !path.basename(f).startsWith("_"),
);
const knownRoutes = new Set(
  htmlFiles.map(
    (f) =>
      "/" +
      path
        .relative(base, f)
        .replaceAll("\\", "/")
        .replace(/\.html$/, "")
        .replace(/^index$/, "")
        .replace(/\/$/, ""),
  ),
);
knownRoutes.add("/");
const titles = new Set();
const descriptions = new Set();
let links = 0,
  images = 0,
  schemas = 0,
  metadata = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const content = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  if (path.normalize(path.dirname(file)) === path.normalize(base) && /^(about|contact|privacy-policy|disclaimer|demo|release-date)\.html$/.test(path.basename(file))) {
    assert.match(content, /http-equiv="refresh"[^>]*\/(?:legal|guides)\//, `${file}: legacy URL must redirect to its canonical replacement`);
    continue;
  }
  if (/guides[\\/][^\\/]+\.html$/.test(file) && /http-equiv="refresh"/.test(content)) {
    assert.match(content, /http-equiv="refresh"[^>]*\/guides\/(?:beginner|online)\//, `${file}: legacy guide must redirect to a rewritten guide`);
    continue;
  }
  if (/updates[\\/][^\\/]+\.html$/.test(file)) {
    assert.match(content, /http-equiv="refresh"[^>]*\/updates\/#/, `${file}: update detail must redirect to its list entry`);
    continue;
  }
  if (/tools[\\/](?:code-checker|player-count)\.html$/.test(file)) {
    assert.match(content, /http-equiv="refresh"[^>]*\/tools\//, `${file}: retired tool must redirect to the tool list`);
    continue;
  }
  assert.ok(!/url=%2Fimages%2Fskins%2F|src="\/images\/skins\//i.test(content), `${file}: third-party character preview is still rendered`);
  if (path.basename(file) === "index.html") {
    assert.match(content, /Featured Looks/, "Home lost the character panel");
    assert.match(content, /Character Codes/, "Home lost the code panel");
    assert.match(content, /featuredGrid/, "Home lost its existing card grid");
    assert.ok(!content.includes("have been withdrawn"), "Home retains an obsolete publication notice");
  }
  assert.ok(
    !/class="[^"]*\bundefined\b/.test(content),
    `${file}: unresolved CSS Module classes`,
  );
  assert.equal(
    (content.match(/<h1[ >]/g) || []).length,
    1,
    `${file}: expected one H1`,
  );
  const title = content.match(/<title>(.*?)<\/title>/)?.[1];
  if (title) {
    assert.ok(!titles.has(title), `${file}: duplicate title`);
    titles.add(title);
    metadata++;
  }
  const description = content.match(
    /<meta name="description" content="([^"]*)"/i,
  )?.[1];
  if (description) {
    assert.ok(!descriptions.has(description), `${file}: duplicate description`);
    descriptions.add(description);
  }
  for (const match of content.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
    const href = match[1].split(/[?#]/)[0].replace(/\/$/, "") || "/";
    if (href.startsWith("/_next") || path.extname(href)) continue;
    assert.ok(knownRoutes.has(href), `${file}: broken local link ${href}`);
    links++;
  }
  for (const match of content.matchAll(/<img\b[^>]*>/g)) {
    assert.match(match[0], /alt="[^"]*"/, `${file}: missing image alt attribute`);
    const src = match[0].match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith("/_next/image?")) {
      const params = new URL(
        "https://example.org" + src.replaceAll("&amp;", "&"),
      ).searchParams;
      const original = params.get("url");
      if (original?.startsWith("/"))
        assert.ok(
          existsSync(path.join("public", original)),
          `${file}: missing ${original}`,
        );
    }
    images++;
  }
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    const data = JSON.parse(match[1]);
    assert.equal(data["@context"], "https://schema.org");
    schemas++;
  }
}
const sitemap = readFileSync(path.join(base, "sitemap.xml.body"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.equal(new Set(urls).size, urls.length);
assert.ok(
  urls.every(
    (url) =>
      url.startsWith("https://justvolleyball.app/") && !url.includes("?"),
  ),
);
const og = await sharp("public/images/og-image.png").metadata();
assert.equal(og.width, 1200);
assert.equal(og.height, 630);
console.log(
  `Verified ${htmlFiles.length} prerendered pages, ${metadata} static metadata sets, ${links} local links, ${images} images, ${schemas} JSON-LD blocks and ${urls.length} sitemap URLs. OG: 1200×630. Dynamic search metadata requires request-time/browser acceptance.`,
);
