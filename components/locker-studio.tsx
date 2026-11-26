"use client";

import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { LockerCardStudio } from "./locker-card-studio";
import { frontOrbit, type Orbit } from "./preview-orbit";
import dynamic from "next/dynamic";
import type { PlayerPreviewHandle } from "./local-player-preview";
const LocalPlayerPreview = dynamic(() => import("./local-player-preview").then(module => module.LocalPlayerPreview), { ssr: false });
import { encodeLocalLook, decodeLocalLook } from "@/lib/local-look";

import { embedAppearanceCodeInPng, extractAppearanceCodeFromPng, MAX_APPEARANCE_PNG_BYTES } from "@/lib/appearance-png";
import { shopHref, tryOnAccessory, type AccessoryCategory } from "@/lib/shop-look";
import styles from "@/styles/locker.module.css";

type Config = Record<string, unknown>;
type Option = { value: string | number; label: string; color?:string; image?:string };
type Field = { key: string; label: string; kind: string; default: unknown; min?: number; max?: number; step?: number; options?: Option[]; section: string };
export type LockerCatalog = { hair: {id:string;label:string;image?:string}[]; facialHair: {id:string;label:string;image?:string}[]; faces: Record<string,{id:string;label:string;index:number;image?:string}[]>; accessories:{id:string;label:string;category:string;price:number;supporter:boolean;availableInBuild?:boolean}[]; fields:Field[]; defaults:Config };
type Result = { image:string; config:Config; code:string; missingAccessories?:string[]; requiredAccessories?:string[]; alphaBounds?:[number,number,number,number]; width?:number; height?:number; orbitAtlas?: never };
type Saved = {name:string;config:Config};
const sections = ["face", "body", "voice", "hair", "accessories", "outfit", "presets", "studio"];
const symbols:Record<string,string>={face:"☻",body:"♟",voice:"♪",hair:"♛",accessories:"♧",outfit:"♙",presets:"▣",studio:"▧"};
const slots = ["head","head2","head3","face","face2","face3","extra","extra2","extra3"];
const dict = (v:unknown): Config => v && typeof v === "object" && !Array.isArray(v) ? v as Config : {};
function shopAccessory(catalog: LockerCatalog, id: string | null) {
  const item = catalog.accessories.find(entry => entry.id === id && entry.availableInBuild && entry.price > 0);
  if (!item || !["head", "face", "extra"].includes(item.category)) return null;
  return { id: item.id, category: item.category as AccessoryCategory };
}
function download(name:string, data:string) { const a=document.createElement("a");a.href=data;a.download=name;a.click(); }

type History = {past:Config[];present:Config;future:Config[]};
type Action = {type:"set";value:Config|((c:Config)=>Config)}|{type:"undo"|"redo"};
function historyReducer(s:History,a:Action):History { if(a.type==="undo")return s.past.length?{past:s.past.slice(0,-1),present:s.past[s.past.length-1],future:[s.present,...s.future]}:s;if(a.type==="redo")return s.future.length?{past:[...s.past,s.present],present:s.future[0],future:s.future.slice(1)}:s;if(a.type==="set")return {past:[...s.past.slice(-39),s.present],present:typeof a.value==="function"?a.value(s.present):a.value,future:[]};return s;}
export function LockerStudio({catalog}:{catalog:LockerCatalog}) {
  const [{present:config,past,future},dispatch]=useReducer(historyReducer,{past:[],present:catalog.defaults,future:[]});
  const setConfig=useCallback((value:Config|((c:Config)=>Config))=>dispatch({type:"set",value}),[]);
  const [section,setSection]=useState("face");
  const [faceTab,setFaceTab]=useState("look");
  const [hairTab,setHairTab]=useState("hair");
  const [renderedConfig,setRenderedConfig]=useState("");
  const [renderedContext,setRenderedContext]=useState("");
  const [orbit,setOrbit]=useState(frontOrbit);
  const { yaw, pitch } = orbit;
  const [outfit,setOutfit]=useState("uniform");
  const [view,setView]=useState("full");
  const [result,setResult]=useState<Result|null>(null);
  const [busy,setBusy]=useState(false);
  const [exporting,setExporting]=useState(false);
  const [message,setMessage]=useState("Preparing your player…");
  const [available,setAvailable]=useState<boolean|null>(null);
  const [auto,setAuto]=useState(true);
  const [code,setCode]=useState("");
  const [json,setJson]=useState("");
  const [saved,setSaved]=useState<Saved[]>([]);
  const [name,setName]=useState("");
  const [search,setSearch]=useState("");
  const previewRef=useRef<PlayerPreviewHandle>(null);
  const startedAutoPreview=useRef(false);
  const importing=useRef(false);
  const version=useRef(0);
  const mounted=useRef(true);
  const initialCode=useRef("");const importedLink=useRef(false);
  const initialItem=useRef<ReturnType<typeof shopAccessory>>(null);
  
  useEffect(()=>{
    mounted.current=true;
    const params = new URLSearchParams(window.location.search);
    initialCode.current = params.get("code") ?? "";
    initialItem.current = shopAccessory(catalog, params.get("item"));
    const item = initialItem.current;
    const shouldApply = item && !initialCode.current;
    queueMicrotask(()=>{if(mounted.current){setAvailable(true);setMessage("Ready to customize");}});
    let cancelled = false;
    queueMicrotask(()=>{
      if (cancelled) return;
      if (item) setSection("accessories");
      if (shouldApply) {
        initialItem.current = null;
        setConfig(current => tryOnAccessory(current, item.id, item.category)?.config ?? current);
      }
      try {
        const presets=JSON.parse(localStorage.getItem("jv-locker-presets")??"[]");
        if(Array.isArray(presets))setSaved(presets.filter(s=>s&&typeof s.name==="string"&&s.config&&typeof s.config==="object"&&!Array.isArray(s.config)).slice(0,50));
      } catch {}
    });
    return()=>{cancelled=true; mounted.current=false;};
  },[catalog,setConfig]);
  const render=useCallback(async function run(payload:Record<string,unknown>) {
    const current=++version.current;
    if(payload.code)importing.current=true;
    setBusy(true);
    try {
      const appearance=payload.code?await decodeLocalLook(String(payload.code)):payload.config as Config;
      const configValue={...catalog.defaults,...appearance};
      const appearanceCode=await encodeLocalLook(configValue);
      if(!mounted.current||current!==version.current)return;
      const required=Object.values(dict(configValue.acc)).flatMap(v=>typeof dict(v).id==="string"&&dict(v).id?[String(dict(v).id)]:[]);
      setResult({config:configValue,code:appearanceCode,image:"",requiredAccessories:required});
      setRenderedContext(JSON.stringify([payload.outfit,payload.view]));
      setRenderedConfig(JSON.stringify(payload.code?configValue:payload.config));
      setMessage("Preview updated");
      if(payload.code){
        const item=initialItem.current;initialCode.current="";initialItem.current=null;
        setConfig(item?tryOnAccessory(configValue,item.id,item.category)?.config??configValue:configValue);setCode("");
      }
    }catch(error){if(mounted.current)setMessage(error instanceof Error?error.message:"Could not load this look.");}
    finally{importing.current=false;if(mounted.current&&current===version.current)setBusy(false);}
  },[catalog.defaults,setConfig]);
  useEffect(()=>{if(!available||importedLink.current||!initialCode.current)return;importedLink.current=true;void render({code:initialCode.current,...frontOrbit,outfit:"uniform",view:"full"});},[available,render]);
  const renderCurrent = useEffectEvent(() => {
    if (!importing.current) {
      startedAutoPreview.current = true;
      void render({ config, ...orbit, outfit, view });
    }
  });
  useEffect(()=>{
    if(!available||!auto||initialCode.current)return;
    const timer=setTimeout(()=>renderCurrent(),0);
    return()=>clearTimeout(timer);
  },[config,outfit,view,auto,available]);
  function rotatePlayer(next: Orbit) {
    if (importing.current || (next.yaw === yaw && next.pitch === pitch)) return;
    setOrbit(next);
  }
  const currentPreview = renderedContext === JSON.stringify([outfit, view]) && renderedConfig === JSON.stringify(config);
  async function exportPlayer() {
    if (!currentPreview || exporting || !result) return;
    setExporting(true);
    try {
      const image=previewRef.current?.capture(result.config);
      if(!image||!result?.code)throw Error("The player preview is not ready yet.");
      const raw=Uint8Array.from(atob(image.split(",")[1]),c=>c.charCodeAt(0));
      const png=embedAppearanceCodeInPng(raw,result.code);
      const url=URL.createObjectURL(new Blob([new Uint8Array(png)],{type:"image/png"}));
      download("just-volleyball-player.png",url);setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not export the portrait.");
    } finally {
      setExporting(false);
    }
  }
  function change(key:string,value:unknown){setConfig(c=>{const extra:Config={};if(key==="vo")extra.vp=([.78,.92,1,1.12,1.3][Number(value)]-.78)/.52;if(["hair","hcol","hc"].includes(key)){extra.hcols=[];extra.hgrad=[];}if(key==="hc"){const colour=catalog.fields.find(f=>f.key==="hc")?.options?.find(o=>o.value===value)?.color;if(colour)extra.hcol=colour.replace(/^#/,"");}return {...c,[key]:value,...extra};});}
  function editField(f:Field,value:unknown){if(f.section==="gear"&&outfit!=="uniform")setConfig(c=>({...c,gg:{...dict(c.gg),[f.key]:value}}));else change(f.key,value);}
  function accessoryField(slot:string,key:string,value:unknown){setConfig(c=>{const acc=dict(c.acc);return {...c,acc:{...acc,[slot]:{...dict(acc[slot]),[key]:value}}};});}
  function savePresets(items:Saved[]){try{localStorage.setItem("jv-locker-presets",JSON.stringify(items));setSaved(items);setMessage("Saved on this device");}catch{setMessage("Device storage is unavailable or full.");}}
  const fields=catalog.fields.filter(f=>((f.section===section&&!(section==="body"&&["vo","vpk","vp","vs"].includes(f.key)))||(section==="outfit"&&f.section==="gear")||(section==="voice"&&["vo","vpk","vpi","vp","vs"].includes(f.key)))&&!['hair','fh'].includes(f.key));
  function control(f:Field){const value=(f.section==="gear"&&outfit!=="uniform"?(dict(config.gg)[f.key]??config[f.key]):config[f.key])??f.default;return <label key={f.key} className={styles.control}><span>{f.label}</span>{f.key==="lh"?<div className={styles.chips}><button aria-pressed={!value} onClick={()=>change("lh",false)}>right handed</button><button aria-pressed={Boolean(value)} onClick={()=>change("lh",true)}>left handed</button></div>:f.kind==="boolean"?<input type="checkbox" checked={Boolean(value)} onChange={e=>editField(f,e.target.checked)}/>:f.kind==="color"?<input type="color" value={`#${String(value).replace(/^#/,"")}`} onChange={e=>editField(f,e.target.value.slice(1))}/>:f.key==="skin"?<div className={styles.swatches}>{f.options?.map(o=><button key={o.value} aria-label={o.label} aria-pressed={value===o.value} style={{background:o.color?`#${o.color.replace(/^#/,"")}`:undefined}} onClick={()=>setConfig(c=>({...c,skin:o.value,skx:false}))}/>)}</div>:f.kind==="select"&&["hs","ear","slen","shl"].includes(f.key)?<div className={styles.chips}>{f.options?.map(o=><button key={o.value} aria-pressed={String(value)===String(o.value)} onClick={()=>editField(f,o.value)}>{o.label}</button>)}</div>:f.key==="kst"?<div className={styles.kitGrid}>{f.options?.map(o=><button key={o.value} aria-label={o.label} aria-pressed={Number(value)===Number(o.value)} onClick={()=>change("kst",Number(o.value))}>{o.image&&<Image src={o.image} width={160} height={160} unoptimized alt={o.label}/>}<span>{o.label}</span></button>)}</div>:f.kind==="select"?<select value={String(value)} onChange={e=>editField(f,typeof f.options?.find(o=>String(o.value)===e.target.value)?.value==="number"?Number(e.target.value):e.target.value)}>{f.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:<div className={styles.range}><input type="range" min={f.min??0} max={f.max??(f.kind==="integer"?99:1)} step={f.step??(f.kind==="integer"?1:0.02)} value={Number(value)} onChange={e=>editField(f,Number(e.target.value))}/><output>{Number(value).toFixed(f.kind==="integer"?0:2)}</output></div>}</label>;}
  return <div className={styles.studio}>
    <section className={styles.preview} aria-label="Player preview">
      <div className={styles.previewTitle}><h1>Just Volleyball Locker</h1><label>showing:<select value={outfit} onChange={e=>setOutfit(e.target.value)}><option value="uniform">captain uniform</option><option value="casual">casual / gym</option><option value="pinny">training pinny</option></select></label></div>
      <div className={styles.stage} role="group" aria-label="Rotate player preview">
        <LocalPlayerPreview ref={previewRef} config={result?.config??catalog.defaults} outfit={outfit} view={view} orbit={orbit} onOrbit={rotatePlayer} onImage={image=>setResult(current=>current?{...current,image}:current)} onError={setMessage}/>
      </div>
      <p className={styles.note}>Drag to rotate and tilt</p>
      <p role="status" className={styles.status}>{message}</p>
      <div className={styles.row}><button onClick={()=>rotatePlayer(frontOrbit)}>Front</button><button onClick={()=>rotatePlayer({yaw:-180,pitch:0})}>Back</button><label>View<select value={view} onChange={e=>setView(e.target.value)}><option value="full">Full body</option><option value="head">Head</option></select></label></div>
      <div className={styles.row}><button className={styles.primary} disabled={available!==true} onClick={()=>void render({config,...orbit,outfit,view})}>Update preview</button><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Auto update</label></div>
      <div className={styles.row}><button disabled={!result||busy||exporting||!currentPreview} onClick={()=>void exportPlayer()}>{exporting ? "Rendering PNG…" : "Download PNG"}</button><button disabled={!result?.code||busy||renderedConfig!==JSON.stringify(config)} onClick={async()=>{try{await navigator.clipboard.writeText(result!.code);setMessage("Appearance code copied");}catch{setMessage("Copy the code from the export field below.");}}}>Copy appearance code</button></div>
      {result?.code&&<label className={styles.export}><span>Game appearance code</span><textarea readOnly value={result.code} rows={3}/></label>}
      {!!(result?.requiredAccessories??result?.missingAccessories)?.length&&<p>Required items: {(result?.requiredAccessories??result?.missingAccessories)?.join(", ")}. Ownership not checked; importing does not unlock items.</p>}
      <p className={styles.note}>Save your look before leaving. In-game lighting, team uniforms and owned items can affect its appearance.</p>
      <a className={styles.shopLink} href={result?.code && renderedConfig === JSON.stringify(config)
        ? `${shopHref()}?${new URLSearchParams({ code: result.code })}` : shopHref()}>
        {result?.code && renderedConfig === JSON.stringify(config) ? "Try Shop items on this look" : "Browse Shop"}
      </a>
    </section>
    <section className={styles.editor} aria-label="Appearance editor">
      <div className={styles.tabs} role="tablist" aria-label="Appearance categories">{sections.map(s=><button key={s} role="tab" aria-selected={s===section} onClick={()=>{setSection(s);setSearch("");}}><span aria-hidden="true">{symbols[s]}</span>{s==="outfit"?"outfits":s}</button>)}</div>
      <div className={styles.controls}>
        <h2>{section==="outfit"?"outfits":section}</h2>
        {section==="face"&&<div className={styles.faceTabs}>{["look","eyes","brows","nose","mouth"].map(t=><button key={t} aria-pressed={faceTab===t} onClick={()=>setFaceTab(t)}>{t}</button>)}</div>}
        {section==="voice"&&<p>Voice settings are saved with your look. Audio playback is not available in this portrait preview.</p>}
        {section==="studio"&&<LockerCardStudio image={result?.image} code={result?.code} orbit={orbit} disabled={busy||!result||!currentPreview}/> }
        {section==="hair"&&<><div className={styles.faceTabs}><button aria-pressed={hairTab==="hair"} onClick={()=>setHairTab("hair")}>hair</button><button aria-pressed={hairTab==="beard"} onClick={()=>setHairTab("beard")}>facial hair</button></div><div className={styles.hairGrid}>{(hairTab==="hair"?catalog.hair:catalog.facialHair).map(h=><button key={h.id} aria-label={h.label} aria-pressed={String(config[hairTab==="hair"?"hair":"fh"]??"")===h.id} onClick={()=>change(hairTab==="hair"?"hair":"fh",h.id)}>{h.image?<Image src={h.image} width={160} height={160} alt={h.label} unoptimized/>:<span className={styles.hairPlaceholder}>{h.id?"♛":"○"}</span>}<span>{h.label}</span></button>)}</div></>}
        {section==="face"&&faceTab==="look"&&catalog.fields.filter(f=>["skin","skx","skc"].includes(f.key)).map(control)}
        {section!=="face"&&fields.map(control)}
        {section==="face"&&faceTab==="look"&&fields.filter(f=>["bl","blc"].includes(f.key)).map(control)}
        
        
        {section==="face"&&<details open><summary>{faceTab==="look"?"blush":"select a shape"}</summary><div className={styles.faceGrid}>{Object.entries(catalog.faces).filter(([category])=>faceTab==="look"?category==="blush":category===faceTab).flatMap(([category,items])=>items.filter(i=>i.image).map(i=><button key={`${category}-${i.id}`} title={i.label} aria-pressed={config[({eyes:"es",brows:"bs",nose:"ns",mouth:"ms",blush:"blsh"} as Record<string,string>)[category]]===i.index} onClick={()=>{const k=({eyes:"es",brows:"bs",nose:"ns",mouth:"ms",blush:"blsh"} as Record<string,string>)[category];if(k)change(k,i.index);if(category==="blush")change("bl",true);}}><>{category==="blush"?<span className={styles.blushShape} role="img" aria-label={i.label} style={{backgroundColor:`#${String(config.blc??"f58585").replace(/^#/,"")}`,maskImage:`url("${i.image}")`,WebkitMaskImage:`url("${i.image}")`}}/>:<Image src={i.image!} width={256} height={128} unoptimized alt={i.label}/>}</><span>{i.label}</span></button>))}</div></details>}
        {section==="face"&&<details className={styles.adjust}><summary>adjust {faceTab==="look"?"blush":faceTab}</summary>{fields.filter(f=>faceTab==="look"?["bz","bw","bhy","bx","bo","blr"].includes(f.key):faceTab==="eyes"?["eyc","elc","ez","ew","eyz","eh","ex","er","epx"].includes(f.key):faceTab==="brows"?f.key.startsWith("b")&&!f.key.startsWith("bl")&&f.key!=="bs":faceTab==="nose"?f.key.startsWith("n")&&f.key!=="ns":f.key.startsWith("m")&&f.key!=="ms").map(control)}</details>}
        {section==="accessories"&&<><p>Up to nine slots. Reusing an item does not grant ownership.</p><input aria-label="Filter accessory options" placeholder="Filter accessories…" value={search} onChange={e=>setSearch(e.target.value)}/>{slots.map(slot=>{const acc=dict(config.acc);const item=dict(acc[slot]);return <div key={slot}><label className={styles.control}><span>{slot}</span><select value={String(item.id??"")} onChange={e=>change("acc",{...acc,[slot]:e.target.value?{...item,id:e.target.value}:{}})}><option value="">None</option>{catalog.accessories.filter(a=>a.label.toLowerCase().includes(search.toLowerCase())||a.id===item.id).map(a=><option key={a.id} value={a.id} disabled={a.availableInBuild===false}>{a.label} · {a.availableInBuild===false?"Unavailable in this build":a.supporter?"Supporter":`${a.price} coins`}</option>)}</select></label>{Boolean(item.id)&&<details><summary>adjust {slot}</summary><p className={styles.note}>Material colours apply to the item’s available surfaces. Slots without a corresponding surface have no visual effect.</p><div className={styles.accessoryColours}>{Array.from({length:8},(_,i)=><label key={i}><span>Colour {i+1}</span><input type="color" value={`#${String((item.cols as string[]|undefined)?.[i]||"ffffff").replace(/^#/,"")}`} onChange={e=>{const cols=[...((item.cols as string[])??[])];while(cols.length<=i)cols.push("");cols[i]=e.target.value.slice(1);accessoryField(slot,"cols",cols);}}/></label>)}</div><button onClick={()=>{accessoryField(slot,"cols",[]);accessoryField(slot,"grads",[]);}}>Reset item colours</button>{["px","py","pz","rx","ry","rz","sc","sx","sy","sz"].map(key=><label key={key} className={styles.control}><span>{({px:"Move horizontal",py:"Move vertical",pz:"Move depth",rx:"Rotate X",ry:"Rotate Y",rz:"Rotate Z",sc:"Overall scale",sx:"Scale X",sy:"Scale Y",sz:"Scale Z"} as Record<string,string>)[key]}</span><div className={styles.range}><input type="range" min="0" max="1" step="0.02" value={Number(item[key]??0.5)} onChange={e=>accessoryField(slot,key,Number(e.target.value))}/><output>{Number(item[key]??0.5).toFixed(2)}</output></div></label>)}<label className={styles.control}><span>Flip item</span><input type="checkbox" checked={Boolean(item.fl)} onChange={e=>accessoryField(slot,"fl",e.target.checked)}/></label></details>}</div>;})}<p>Additional imported slots and per-material gradients are preserved in the complete configuration below.</p></>}
        {section==="outfit"&&<p className={styles.note}>Editing {outfit==="uniform"?"uniform equipment":"gym equipment (casual and pinny)"}. Change “showing” above the player to switch equipment sets.</p>}
        {section==="outfit"&&<fieldset><legend>Captain kit colours</legend>{["Jersey","Shorts","Trim","Number"].map((label,i)=><label key={label} className={styles.control}><span>{label}</span><input type="color" value={`#${String((config.kh as string[]|undefined)?.[i]??"ffffff")}`} onChange={e=>{const kh=[...((config.kh as string[])??["4d8cf2","17171c","ffffff","ffffff"])];kh[i]=e.target.value.slice(1);change("kh",kh);}}/></label>)}</fieldset>}
        {section==="presets"&&<><label className={styles.export}><span>Import a JV1 / JV2 appearance code</span><textarea rows={4} value={code} onChange={e=>setCode(e.target.value)} placeholder="JV2:…"/></label><button className={styles.primary} disabled={!code.trim()||available!==true} onClick={()=>void render({code:code.trim(),...orbit,outfit,view})}>Import and preview</button><label className={styles.export}><span>Import a game-exported PNG player card</span><input type="file" accept="image/png,.png" disabled={available!==true} onChange={async e=>{const input=e.currentTarget;const file=input.files?.[0];if(!file)return;try{if(file.size>MAX_APPEARANCE_PNG_BYTES)throw Error("Player card is too large (maximum 8 MB).");const imported=extractAppearanceCodeFromPng(new Uint8Array(await file.arrayBuffer()));setCode(imported);await render({code:imported,...orbit,outfit,view});}catch(error){setMessage(error instanceof Error?error.message:"Could not read the player card.");}finally{input.value="";}}}/><small>Reads the embedded appearance code locally. Plain screenshots and QR-only pictures are not supported.</small></label><hr/><label className={styles.control}><span>Preset name</span><input value={name} maxLength={60} onChange={e=>setName(e.target.value)} placeholder="My look"/></label><button disabled={saved.length>=50} onClick={()=>savePresets([...saved,{name:name.trim()||`Look ${saved.length+1}`,config}])}>Save on this device · {saved.length}/50</button>{saved.map((s,i)=><div key={i} className={styles.saved}><button onClick={()=>{setConfig(s.config);setMessage(`Loaded ${s.name}`);}}>{s.name}</button><button aria-label={`Remove ${s.name}`} onClick={()=>savePresets(saved.filter((_,n)=>n!==i))}>Remove</button></div>)}<button onClick={()=>download("just-volleyball-look.json",`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(renderedConfig===JSON.stringify(config)?result?.config??config:config,null,2))}`)}>Download look JSON</button><label className={styles.export}><span>Load look JSON</span><input type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>128000)throw Error("File too large");const parsed=JSON.parse(await file.text());if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error("Expected a look object");setConfig(parsed);setMessage("Configuration loaded");}catch(error){setMessage(error instanceof Error?error.message:"Invalid JSON");}e.target.value="";}}/></label></>}
        <details className={styles.advanced} onToggle={e=>{if(e.currentTarget.open)setJson(JSON.stringify(config,null,2));}}><summary>Complete appearance configuration</summary><p>Edit appearance fields, accessory transforms and material colours. Import/export keeps appearance fields, including additional settings in imported looks.</p><textarea aria-label="Complete appearance JSON" rows={12} value={json} onChange={e=>setJson(e.target.value)}/><button onClick={()=>{try{const parsed=JSON.parse(json);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error("Expected an object");setConfig(parsed);setMessage("Configuration applied");}catch(error){setMessage(error instanceof Error?error.message:"Invalid JSON");}}}>Apply configuration</button></details>
        <div className={styles.history}><button disabled={!past.length} onClick={()=>dispatch({type:"undo"})}>undo</button><button disabled={!future.length} onClick={()=>dispatch({type:"redo"})}>redo</button><button onClick={()=>{const r=catalog.faces;setConfig(c=>({...c,hair:catalog.hair[Math.floor(Math.random()*catalog.hair.length)].id,es:r.eyes[Math.floor(Math.random()*r.eyes.length)].index,ms:r.mouth[Math.floor(Math.random()*r.mouth.length)].index}));}}>randomize</button></div><button className={styles.reset} onClick={()=>{setConfig(catalog.defaults);setOrbit(frontOrbit);setOutfit("uniform");setMessage("Default look restored");if(available&&!importing.current)void render({config:catalog.defaults,...frontOrbit,outfit:"uniform",view});}}>Reset appearance</button>
      <button className={styles.saveLook} disabled={saved.length>=50} onClick={()=>savePresets([...saved,{name:name.trim()||`Look ${saved.length+1}`,config}])}>save look on this device</button></div>
    </section>
  </div>;
}
