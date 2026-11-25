import test from "node:test";
import assert from "node:assert/strict";
import {runNotification} from "../scripts/run-indexnow.mjs";
test("first-send gate blocks all network before Bing verification",async()=>{
  let calls=0;const fetch=async()=>{calls++;throw Error("Unexpected network");};
  const result=await runNotification({config:{enabled:false},send:true},{fetch});
  assert.equal(result.mode,"disabled");assert.equal(calls,0);assert.equal(result.checkpoint,undefined);
});
test("verified origin must match before any notification",async()=>{
  let calls=0;await assert.rejects(()=>runNotification({config:{enabled:true,siteUrl:"https://justvolleyball.app",bingVerifiedOrigin:"https://other.test",bingVerifiedAt:"2026-11-25"},send:true},{fetch:async()=>{calls++;}}),/canonical origin/);assert.equal(calls,0);
});
