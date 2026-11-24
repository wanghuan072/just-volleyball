// Explicit integration check against a server already started by the user.
// Does not start or restart Next.js or leave a resident renderer running.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const origin=process.env.JV_VERIFY_ORIGIN||"http://localhost:3000";
const folder="artifacts/locker-verification";
await mkdir(folder,{recursive:true});
const checks=[];
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
function pngCode(bytes){
  for(let offset=8;offset+12<=bytes.length;){
    const length=bytes.readUInt32BE(offset),type=bytes.toString("ascii",offset+4,offset+8);
    if(type==="tEXt"){
      const data=bytes.subarray(offset+8,offset+8+length),zero=data.indexOf(0);
      if(data.subarray(0,zero).toString()==="jvlook")return data.subarray(zero+1).toString();
    }
    offset+=12+length;
  }
  return "";
}
async function render(label,payload){
  const start=Date.now();
  const response=await fetch(`${origin}/api/locker/render/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const result=await response.json();
  assert.equal(response.status,200,`${label}: ${result.error}`);
  assert.match(result.code,/^JV2:/);
  assert.ok(result.image.startsWith("data:image/png;base64,"));
  const image=Buffer.from(result.image.split(",")[1],"base64");
  assert.equal(pngCode(image),result.code,`${label}: game metadata missing from exported PNG`);
  assert.equal(result.rendererInfo.pngCodeEmbedded,true);
  await writeFile(`${folder}/${label}.png`,image);
  const metadata=Object.fromEntries(Object.entries(result).filter(([key])=>key!=="image"));
  await writeFile(`${folder}/${label}.json`,JSON.stringify(metadata,null,2));
  checks.push({label,milliseconds:Date.now()-start,imageSha256:sha(image),codeSha256:sha(result.code),model:result.rendererInfo.modelPath});
  return result;
}
const status=await fetch(`${origin}/api/locker/render/`).then(r=>r.json());
assert.equal(status.available,true,status.message);
const base=await render("default",{config:{},yaw:0,outfit:"uniform",view:"full"});
const customConfig={...base.config,hair:"fall",hcol:"ffcc00",hcols:[],es:11,eyc:"9da5df",ms:15,bl:true,blk:"swirl",blsh:6,blc:"eac9ba",num:21,h:0.8,w:0.3,hs:1,ear:"Pointy",kh:["7e42cf","17171c","ffffff","ffffff"],acc:{extra:{id:"scarf"}}};
const custom=await render("custom",{config:customConfig,yaw:0,outfit:"uniform",view:"full"});
assert.equal(custom.config.hair,"fall");assert.equal(custom.config.es,11);assert.equal(custom.config.num,21);
assert.equal(custom.config.ear,"Pointy");assert.deepEqual(custom.requiredAccessories,["scarf"]);
assert.notEqual(custom.code,base.code);
const imported=await render("code-roundtrip",{code:custom.code,yaw:0,outfit:"uniform",view:"full"});
assert.equal(imported.code,custom.code);assert.deepEqual(imported.config,custom.config);
const casual=await render("casual",{code:custom.code,yaw:0,outfit:"casual",view:"full"});
assert.equal(casual.code,custom.code);
const back=await render("back",{code:custom.code,yaw:180,outfit:"uniform",view:"full"});
assert.equal(back.code,custom.code);
const pinny=await render("pinny",{code:custom.code,yaw:45,outfit:"pinny",view:"head"});
assert.equal(pinny.width,512);assert.equal(pinny.height,512);
for(const label of ["custom","casual","back","pinny"])assert.notEqual(checks.find(c=>c.label===label).imageSha256,checks.find(c=>c.label==="default").imageSha256);
assert.notEqual(checks.find(c=>c.label==="casual").imageSha256,checks.find(c=>c.label==="custom").imageSha256);
assert.notEqual(checks.find(c=>c.label==="back").imageSha256,checks.find(c=>c.label==="custom").imageSha256);
const bad=await fetch(`${origin}/api/locker/render/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({config:{hair:"../../bad"}})});
assert.equal(bad.status,400);
const invalid=await fetch(`${origin}/api/locker/render/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:"JV2:abcd"})});
assert.equal(invalid.status,400);
const manifest=JSON.parse(await readFile("data/locker-thumbnail-manifest.json","utf8"));
assert.equal(manifest.items.length,100);
for(const item of manifest.items)assert.equal(sha(await readFile(`public${item.image}`)),item.imageSha256);
await writeFile(`${folder}/checks.json`,JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,thumbnails:manifest.items.length,invalidResourceRejected:true,invalidCodeRejected:true,liveGameImportTested:false},null,2));
console.log(`Passed ${checks.length} original-engine renders, native code round-trip, embedded PNG codes, invalid input rejection and ${manifest.items.length} thumbnail hashes.`);
