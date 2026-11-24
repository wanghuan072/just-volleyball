import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const loadedModule={exports:{}};
const compiled=ts.transpileModule(readFileSync("lib/appearance-png.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
vm.runInThisContext(`(function(module,exports){${compiled}\n})`)(loadedModule,loadedModule.exports);
const {extractAppearanceCodeFromPng:extract,embedAppearanceCodeInPng:embed,MAX_APPEARANCE_PNG_BYTES}=loadedModule.exports;
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(type,data=Buffer.alloc(0)){const typed=Buffer.concat([Buffer.from(type),data]);const len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(typed));return Buffer.concat([len,typed,sum]);}
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
function png(code){const header=Buffer.alloc(13);header.writeUInt32BE(1);header.writeUInt32BE(1,4);header[8]=8;header[9]=6;return Buffer.concat([signature,chunk("IHDR",header),...(code===undefined?[]:[chunk("tEXt",Buffer.from(`jvlook\0${code}`))]),chunk("IEND")]);}
test("embedded appearance metadata round trips without mutating the source PNG",()=>{
  const original=png(),snapshot=Buffer.from(original);
  const result=embed(original,"JV2:abcd_012-");
  assert.equal(extract(result),"JV2:abcd_012-");
  assert.deepEqual(original,snapshot);
  assert.notEqual(result,original);
  assert.throws(()=>embed(original,"JV2:"),/invalid appearance/);
});
test("embedding replaces an existing jvlook chunk and preserves valid CRCs",()=>{
  const original=png("JV2:old_code"),snapshot=Buffer.from(original);
  const result=embed(original,"JV2:new_code");
  assert.equal(extract(result),"JV2:new_code");
  assert.deepEqual(original,snapshot);
  assert.equal(Buffer.from(result).toString("ascii").split("jvlook").length-1,1);
  const broken=Buffer.from(original);broken[48]^=1;
  assert.throws(()=>embed(broken,"JV2:abcd"),/checksum/);
});
test("original game jvlook PNG metadata imports JV1/JV2 and offset byte views",()=>{
  for(const code of ["JV2:abc_-012","JV1:abc+/=="]){const p=png(code);assert.equal(extract(p),code);const wrapped=Buffer.concat([Buffer.from([9,9]),p]);assert.equal(extract(wrapped.subarray(2)),code);}
});
test("PNG parser rejects missing metadata, invalid CRC, truncation, oversized inputs and invalid envelopes",()=>{
  assert.throws(()=>extract(png()),/No embedded/);
  const good=png("JV2:abcd"),broken=Buffer.from(good);broken[48]^=1;
  assert.throws(()=>extract(broken),/checksum/);
  assert.throws(()=>extract(good.subarray(0,good.length-1)),/truncated/);
  const badSize=Buffer.from(good);badSize.writeUInt32BE(0xffffffff,33);
  assert.throws(()=>extract(badSize),/bounds/);
  assert.throws(()=>extract(Buffer.alloc(MAX_APPEARANCE_PNG_BYTES+1)),/8 MB/);
  assert.throws(()=>extract(png("JV2:"+"a".repeat(16385))),/size limit/);
  assert.throws(()=>extract(png("JV3:abc")),/invalid appearance/);
  assert.throws(()=>extract(Buffer.concat([good,Buffer.from([0])])),/trailing/);
  assert.throws(()=>extract(Buffer.from("JPEG")),/PNG player card/);
});

