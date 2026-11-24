import format from "@/data/code-format.json";
type Dict = Record<string, unknown>;
type Field = [string, number, unknown, number, number?];
type Group = (Field | Group)[];
const c = format.constants;
const groups = c.GROUPS as unknown as Group[];
const gearFields = c.GEAR_FIELDS as Field[];
const nested = (v: Field | Group): v is Group => Array.isArray(v[0]);
const object = (v: unknown): v is Dict => v !== null && typeof v === "object" && !Array.isArray(v);
const copy = (v: unknown): unknown => JSON.parse(JSON.stringify(v));
const fields = (g: Group): Field[] => g.flatMap(f => nested(f) ? fields(f) : [f]);
const atRev = (g: Group, rev: number): Group => g.filter(f=>nested(f)||(f[4]??0)<=rev).map(f=>nested(f)?atRev(f,rev):f);
const gearBase = () => Object.fromEntries(gearFields.map(f=>[f[0],copy(f[2])]));
const safeKey = (key:string) => !["__proto__","constructor","prototype"].includes(key);
export function crc32(bytes:Uint8Array) {
  let crc=0xffffffff;
  for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
class Reader {
  p=0;rev=0;seen:string[]=[];
  constructor(readonly bytes:Uint8Array){}
  take(n:number){
    if(n<0||n>32||this.p+n>this.bytes.length*8)throw Error("Truncated preset data.");
    let v=0;for(let i=0;i<n;i++,this.p++)v=v*2+((this.bytes[this.p>>>3]>>>(7-this.p%8))&1);return v;
  }
  flag(){return this.take(1)===1;}
  uint(w:number){
    let v=this.take(w);if(v<2**w-1)return v;
    for(let shift=0;shift<32;shift+=4){const more=this.flag();v+=this.take(4)*2**shift;if(!more)return v;}
    throw Error("Invalid variable integer.");
  }
  color():string{
    if(!this.flag()){const v=this.take(24).toString(16).padStart(6,"0");this.seen.push(v);return v;}
    const palette=this.flag();const values=palette?c.PALETTE:this.seen;
    const i=this.take(palette?6:Math.ceil(Math.log2(Math.max(values.length,1))));
    if(values[i]===undefined)throw Error("Invalid colour reference.");return values[i];
  }
  text(){const seven=this.flag(),n=this.uint(seven?6:5);if(n>c.MAX_TEXT)throw Error("Text too long.");return Array.from({length:n},()=>seven?String.fromCharCode(this.take(7)):c.ALPHA[this.take(6)]).join("");}
  name(table:string[],w:number){const i=this.uint(w);if(!i)return this.text();if(table[i-1]===undefined)throw Error("Invalid resource reference.");return table[i-1];}
  list<T>(read:()=>T){const n=this.uint(4);if(n>c.MAX_LIST)throw Error("List too long.");return Array.from({length:n},read);}
  colors(){return this.list(()=>this.flag()?this.color():"");}
  gradients(){return this.list(()=>{const g:Dict={};if(this.flag()){
    if(this.flag())g.on=this.flag();if(this.flag())g.b=this.color();for(const k of ["fs","fe"])if(this.flag())g[k]=Math.min(this.take(7),100)/100;
  }return g;});}
  json(){const n=this.uint(8);if(n>c.MAX_JSON)throw Error("Extra data too long.");const b=Uint8Array.from({length:n},()=>this.take(8));const v:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(b));if(!object(v))throw Error("Expected a preset object.");return v;}
  accessory(){const d:Dict={};const id=this.name(c.ACC_IDS,6);if(id)d.id=id;
    if(this.flag())for(const k of c.ACC_MOVES)if(this.flag())d[k]=Math.min(this.take(6),50)/50;
    if(this.flag())d.fl=true;if(this.flag())d.cols=this.colors();if(this.flag())d.grads=this.gradients();
    if(this.flag())for(const[k,v]of Object.entries(this.json()))if(!Object.hasOwn(d,k)&&safeKey(k))d[k]=v;return d;
  }
  value(f:Field,d:Dict,base=f[2]):unknown{
    const[k,t,,w]=f;switch(t){
      case 0:return !base;case 1:return this.uint(w);case 2:return this.uint(w)-1;
      case 3:return Math.min(this.take(6),50)/50;case 4:return this.color();
      case 5:return this.name((c.NAME_TABLES as Record<string,string[]>)[k],w);
      case 6:return this.colors();case 7:return this.gradients();
      case 8:return Array.from({length:this.flag()?4:3},(_,i)=>this.flag()?(base as string[])[i]:this.color());
      case 9:{const g=gearBase();if(this.flag())for(const gf of gearFields)g[gf[0]]=d[gf[0]]??gf[2];for(const gf of atRev(gearFields,this.rev) as Field[])if(this.flag())g[gf[0]]=this.value(gf,d,g[gf[0]]);return g;}
      case 10:{const slots=c.ACC_SLOTS.filter(()=>this.flag());if(this.flag()){const n=this.uint(2);if(n>4)throw Error("Too many extra slots.");for(let i=0;i<n;i++)slots.push(this.text());}return Object.fromEntries(slots.map(s=>[s,this.accessory()]));}
      default:throw Error("Unknown field type.");
    }
  }
  group(g:Group,d:Dict){if(!g.length||!this.flag())return;for(const f of g){if(nested(f))this.group(f,d);else if(g.length===1||this.flag())d[f[0]]=this.value(f,d);}}
}
export function unpackLook(bytes:Uint8Array){
  const r=new Reader(bytes);r.rev=r.uint(2);if(r.rev>c.REVISION)throw Error("Newer format revision than game 1.0.3.");
  const d:Dict=Object.fromEntries(fields(groups).map(f=>[f[0],copy(f[2])]));d.gg=gearBase();d.acc={};
  for(const g of groups)r.group(atRev(g as Group,r.rev),d);
  for(const f of fields(groups))if((f[4]??0)>r.rev){delete d[f[0]];if(object(d.gg))delete d.gg[f[0]];}
  if(r.flag())for(const[k,v]of Object.entries(r.json())){
    if(k==="gg"&&object(v)&&object(d.gg))d.gg={...v,...d.gg};else if(!Object.hasOwn(d,k)&&safeKey(k))d[k]=v;
  }
  return {revision:r.rev,dictionary:d};
}
export type CodeResult={status:"empty"|"error"|"notice";message:string;format?:string;revision?:number;look?:{hair:string;number:number;accessories:string[];unknownResources:string[]}};
function summary(d:Dict,type:string,revision?:number):CodeResult{
  const hair=typeof d.hair==="string"?d.hair:"2twists";
  const accessories=object(d.acc)?[...new Set(Object.values(d.acc).flatMap(v=>object(v)&&typeof v.id==="string"&&v.id?[v.id]:[]))]:[];
  const unknownResources=[...(!c.HAIRS.includes(hair)?[hair]:[]),...accessories.filter(id=>!c.ACC_IDS.includes(id))];
  return {status:"notice",format:type,revision,message:`${type} checksum and ${type==="JV2"?"packed fields":"JSON structure"} passed against game 1.0.3. ${unknownResources.length?"Some resource IDs need review. ":""}This does not test in-game rendering or grant missing accessories.`,look:{hair,number:typeof d.num==="number"?d.num:1,accessories,unknownResources}};
}
export async function checkCode(input:string):Promise<CodeResult>{
  if(!input.trim())return{status:"empty",message:"Paste a JV1 or JV2 character code."};
  const tag=/JV2:/i.exec(input)??/JV1:/i.exec(input);if(!tag)return{status:"error",message:"No JV1: or JV2: appearance code found."};
  const type=tag[0].toUpperCase(),rest=input.slice(tag.index+4);
  const body=(type==="JV2:"?/^[A-Za-z0-9_-]*/:/^[A-Za-z0-9+/=]*/).exec(rest)![0];
  if(!body||body.length>format.share.MAX_CODE_CHARS)return{status:"error",message:"The code body is missing or exceeds the game limit."};
  try{
    if((type==="JV2:"&&(body.length<4||body.length%4===1))||(type==="JV1:"&&(body.length<12||body.length%4!==0)))throw Error("Invalid Base64 length.");
    const encoded=body.replace(/-/g,"+").replace(/_/g,"/");
    const bytes=Uint8Array.from(atob(encoded+"=".repeat((4-encoded.length%4)%4)),ch=>ch.charCodeAt(0));
    if(type==="JV2:"){
      if(bytes.length<3)throw Error("Code body too short.");const payload=bytes.slice(2);
      if(bytes[0]*256+bytes[1]!== (crc32(payload)&65535))throw Error("Checksum mismatch. Copy the complete original code again.");
      const parsed=unpackLook(payload);return summary(parsed.dictionary,"JV2",parsed.revision);
    }
    if(bytes.length<5)throw Error("Code body too short.");const payload=bytes.slice(4);
    if(bytes[0]*2**24+bytes[1]*2**16+bytes[2]*256+bytes[3]!==crc32(payload))throw Error("Checksum mismatch. Copy the complete original code again.");
    if(typeof DecompressionStream==="undefined")throw Error("JV1 decoding needs a browser with DecompressionStream support. The game still accepts JV1.");
    const reader=new Blob([payload]).stream().pipeThrough(new DecompressionStream("deflate")).getReader();
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const{value,done}=await reader.read();if(done)break;length+=value.length;if(length>format.share.MAX_LOOK_BYTES)throw Error("JV1 exceeds the game size limit.");chunks.push(value);}}finally{await reader.cancel();}
    const plain=new Uint8Array(length);let offset=0;for(const chunk of chunks){plain.set(chunk,offset);offset+=chunk.length;}
    const d:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(plain));if(!object(d))throw Error("Expected a character dictionary.");return summary(d,"JV1");
  }catch(e){return{status:"error",message:e instanceof Error?e.message:"The code could not be decoded."};}
}
