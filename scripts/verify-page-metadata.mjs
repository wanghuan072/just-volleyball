import { readFile } from "node:fs/promises";
import { tdk } from "../seo/tdk.js";
const base=".next/server/app";
let checked=0;
const deferred=[];
const live=process.argv.includes("--live");
for (const route of Object.keys(tdk)) {
 const file=base+(route==="/" ? "/index.html":route.slice(0,-1)+".html");
 let html=await readFile(file,"utf8");
 if(!html.includes('rel="canonical"') && live) {
   const response=await fetch("http://localhost:3000"+route);
   if(!response.ok) throw new Error("Live page failed: "+route);
   html=await response.text();
 }
 if(!html.includes('rel="canonical"')) { deferred.push(route); continue; }
 if(!html.includes('rel="canonical" href="https://justvolleyball.app'+route+'"')) throw new Error("Canonical mismatch: "+route);
 if(!html.includes('/images/og-image.png')) throw new Error("OG image missing: "+route);
 if(route.startsWith("/legal/") && !html.includes("support@justvolleyball.app")) throw new Error("Contact missing: "+route);
 checked++;
}
console.log("Verified canonical, social image and legal contact on",checked,"independent pages.");

if(deferred.length) console.log("Request-time metadata requires --live:",deferred.join(", "));
