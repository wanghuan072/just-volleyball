import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = readFileSync("lib/locker-validation.ts", "utf8");
const compiled = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
const mod = {exports:{}};
vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`)((name)=>{
  if(name === "@/data/code-format.json")return JSON.parse(readFileSync("data/code-format.json","utf8"));
  throw Error(name);
},mod,mod.exports);
const {validateLockerInput,LockerValidationError} = mod.exports;
test("locker preserves unknown Studio JSON and accepts actual face indices",()=>{
  const config={hair:"shrimpy",es:31,bs:-1,ns:-1,ms:16,blsh:6,h:0.6,kh:["ffcc00","111111","ffffff"],studio:{layers:[{name:"design",opacity:0.5}]}};
  const result=validateLockerInput({config});
  assert.deepEqual(result.config,config);
  assert.equal(result.outfit,"uniform");
  assert.notEqual(result.config,config);
});
test("locker rejects dangerous JSON and unbounded input",()=>{
  const cases=[JSON.parse('{"config":{"__proto__":{"polluted":true}}}'),{config:{h:NaN}},{config:{h:Infinity}},{config:{hair:"res://bad.gd"}},{config:{h:1.1}},{config:{kh:["red","blue","white"]}},{config:{es:32}},{config:{acc:{head:{id:"../../bad"}}}},{config:{name:"x".repeat(17000)}}];
  for(const value of cases)assert.throws(()=>validateLockerInput(value),LockerValidationError);
  const cyclic={};cyclic.self=cyclic;
  assert.throws(()=>validateLockerInput({config:cyclic}),/cycles/);
  let deep={};for(let i=0;i<14;i++)deep={child:deep};
  assert.throws(()=>validateLockerInput({config:deep}),/nesting/);
  assert.throws(()=>validateLockerInput({config:{large:Array.from({length:100},()=>"x".repeat(1500))}}),/128 KB/);
});
test("locker validates modes and code envelope while engine retains checksum ownership",()=>{
  assert.equal(validateLockerInput({code:"JV2:abcd_012-",yaw:180,view:"head",outfit:"pinny"}).code,"JV2:abcd_012-");
  assert.equal(validateLockerInput({config:{}}).pitch, 0);
  assert.equal(validateLockerInput({config:{},pitch:35}).pitch, 35);
  assert.throws(()=>validateLockerInput({config:{},pitch:-51}), /Pitch/);
  for(const value of [{code:"JV3:abcd"},{code:"JV2:"},{code:"JV2:"+"x".repeat(16385)},{config:{},yaw:361},{config:{},view:"file"},{config:{},outfit:"admin"},{}])assert.throws(()=>validateLockerInput(value),LockerValidationError);
});
