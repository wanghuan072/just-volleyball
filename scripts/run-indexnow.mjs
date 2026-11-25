import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notifyIndexNow, writeCheckpoint } from "./notify-indexnow.mjs";
import { assertManifest } from "./seo-manifest-lib.mjs";

export async function runNotification({config,send=false,checkpoint=null,current,env=process.env}, {fetch:request=globalThis.fetch}={}) {
  if (!send) return notifyIndexNow({current,checkpoint});
  // Both automatic runs and manual retries use this first-send gate.
  if (!config.enabled) return {mode:"disabled",reason:"Bing Verify has not been confirmed; no requests or receipt writes"};
  if (config.bingVerifiedOrigin !== config.siteUrl || !config.bingVerifiedAt) throw Error("Bing verification must match this canonical origin");
  if (env.GITHUB_REPOSITORY !== config.repository || !["status","workflow_dispatch"].includes(env.GITHUB_EVENT_NAME)) throw Error("Only this repository's trusted production-success workflow may send");
  const response=await request(`${config.siteUrl}/seo-manifest.json`,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000)});
  if (!response.ok || !(response.headers.get("content-type")??"").includes("application/json")) throw Error("Production manifest is not available");
  const published=await response.json();assertManifest(published);
  if (published.siteUrl !== config.siteUrl || published.deployment?.projectId !== config.projectId || published.deployment?.environment !== "production") throw Error("Wrong production project or origin");
  if (env.GITHUB_EVENT_NAME === "status") {
    const event=JSON.parse(await fs.readFile(env.GITHUB_EVENT_PATH,"utf8"));
    if(event.sender?.login !== "vercel[bot]" || event.context !== "Vercel" || event.state !== "success") throw Error("Untrusted deployment event");
    if(event.sha !== published.deployment.commit) return {mode:"superseded",reason:"Event SHA is not the current production version"};
    if(!event.target_url?.startsWith("https://vercel.com/whs-projects-f97a952d/just-volleyball/")) throw Error("Status targets another project");
  }
  return notifyIndexNow({current:published,checkpoint,key:config.key,manifestUrl:`${config.siteUrl}/seo-manifest.json`,send:true,production:true},{fetch:request});
}

async function main(){
  const config=JSON.parse(await fs.readFile("seo/indexnow.json","utf8"));
  const send=process.argv.includes("--send");
  // Disabled sends do not even load a checkpoint or access the network.
  if(send&&!config.enabled){console.log(JSON.stringify(await runNotification({config,send})));return;}
  const checkpointFile=process.env.INDEXNOW_CHECKPOINT ?? "seo/indexnow-checkpoint.json";
  const checkpoint=JSON.parse(await fs.readFile(checkpointFile,"utf8"));
  const current=send?undefined:JSON.parse(await fs.readFile("public/seo-manifest.json","utf8"));
  const result=await runNotification({config,send,checkpoint,current});
  if(result.checkpoint) writeCheckpoint(checkpointFile,result.checkpoint);
  console.log(JSON.stringify({...result,checkpoint:undefined},null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exitCode=1;});
