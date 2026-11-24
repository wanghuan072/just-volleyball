import format from "@/data/code-format.json";

export const MAX_LOCKER_BYTES = 128 * 1024;
export class LockerValidationError extends Error {
  readonly status = 400;
  constructor(message: string) { super(message); this.name = "LockerValidationError"; }
}
export type LockerInput = {
  config?: Record<string, unknown>;
  code?: string;
  yaw: number;
  pitch: number;
  outfit: "uniform" | "casual" | "pinny";
  view: "full" | "head";
  orbitAtlas?: boolean;
};
function fail(message: string): never { throw new LockerValidationError(message); }
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const forbidden = new Set(["__proto__", "prototype", "constructor"]);
function inspect(v: unknown, depth = 0, seen = new Set<object>()): void {
  if (depth > 12) fail("Configuration nesting exceeds 12 levels.");
  if (typeof v === "number" && !Number.isFinite(v)) fail("All numeric values must be finite.");
  if (typeof v === "string" && v.length > 16388) fail("A configuration string is too long.");
  if (v === null || ["string", "number", "boolean"].includes(typeof v)) return;
  if (typeof v !== "object") fail("Configuration must contain only JSON values.");
  const obj = v as object;
  if (seen.has(obj)) fail("Configuration cannot contain cycles.");
  seen.add(obj);
  if (Array.isArray(v)) {
    if (v.length > 4096) fail("A configuration array is too long.");
    for (const item of v) inspect(item, depth + 1, seen);
  } else {
    if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) fail("Configuration must use plain objects.");
    if (Object.keys(obj).length > 512) fail("Too many configuration fields.");
    for (const key of Object.keys(obj)) {
      if (forbidden.has(key) || key.length > 64) fail("Invalid configuration key.");
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (descriptor?.get || descriptor?.set) fail("Configuration cannot contain accessors.");
      inspect(descriptor?.value, depth + 1, seen);
    }
  }
  seen.delete(obj);
}
const color = (v: unknown) => typeof v === "string" && /^(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
const units = new Set("h w ez ew eyz eh ex er epx bh br bsp bsz bwid bht bpx mz mw my mh mr mpx nz nw ny nh nx bz bw bhy bx bo blr vp vs fpx fpy fpz frx fry frz fsc fsx fsy fsz".split(" "));
const colors = new Set("hcol ec eyc elc bwc blc sk kp kpl sh gt gs hdc skc shl".split(" "));
const booleans = new Set("nfl hfl bl lh gso gkp hdx kpm skx shm spl ndv".split(" "));
// Bounds follow CharacterConfig._int_bound, including dynamically scanned face parts.
const ints: Record<string, [number, number]> = {
  face:[0,63],skin:[0,15],hc:[0,11],es:[0,31],bs:[-1,6],ms:[0,16],ns:[-1,4],blsh:[0,6],hs:[0,3],sl:[0,3],skl:[0,1],kps:[0,1],kpw:[0,2],kpsl:[0,1],vo:[0,4],num:[0,99],gsh:[0,15],vpk:[0,1],lvl:[0,999],
};
function validateConfig(config: Record<string, unknown>) {
  for (const [key,value] of Object.entries(config)) {
    if (units.has(key) && (typeof value !== "number" || value < 0 || value > 1)) fail(`${key} must be between 0 and 1.`);
    if (colors.has(key) && !color(value)) fail(`${key} must be a hexadecimal colour without #.`);
    if (booleans.has(key) && typeof value !== "boolean") fail(`${key} must be boolean.`);
    if (ints[key] && (typeof value !== "number" || !Number.isInteger(value) || value < ints[key][0] || value > ints[key][1])) fail(`${key} is outside the game's allowed range.`);
  }
  if (config.hair !== undefined && (typeof config.hair !== "string" || !format.constants.HAIRS.includes(config.hair))) fail("Unknown hair resource ID.");
  for (const key of ["ear", "fh", "blk"]) if (config[key] !== undefined && (typeof config[key] !== "string" || !/^[a-zA-Z0-9_ -]{0,48}$/.test(config[key] as string))) fail(`Invalid ${key} resource name.`);
  if (config.kh !== undefined && (!Array.isArray(config.kh) || config.kh.length < 3 || config.kh.length > 4 || !config.kh.every(color))) fail("Uniform colours must contain three or four hexadecimal colours.");
  if (config.gg !== undefined) {
    if (!record(config.gg)) fail("Casual gear must be an object.");
    validateConfig(config.gg);
  }
  if (config.acc !== undefined) {
    if (!record(config.acc) || Object.keys(config.acc).length > 12) fail("Accessories must be an object with at most 12 slots.");
    for (const [slot, item] of Object.entries(config.acc)) {
      if (!/^[a-zA-Z0-9_ -]{1,24}$/.test(slot) || !record(item) || Object.keys(item).length > 16) fail("Invalid accessory slot.");
      if (typeof item.id !== "string" || (item.id !== "" && !format.constants.ACC_IDS.includes(item.id))) fail("Unknown accessory resource ID.");
      for (const key of format.constants.ACC_MOVES) if (item[key] !== undefined && (typeof item[key] !== "number" || (item[key] as number) < 0 || (item[key] as number) > 1)) fail(`Accessory ${key} must be between 0 and 1.`);
      if (item.fl !== undefined && typeof item.fl !== "boolean") fail("Accessory flip must be boolean.");
      if (item.cols !== undefined && (!Array.isArray(item.cols) || item.cols.length > 8 || !item.cols.every(v => v === "" || color(v)))) fail("Accessory colours are invalid.");
    }
  }
}
export function validateLockerInput(value: unknown): LockerInput {
  inspect(value);
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_LOCKER_BYTES) fail("Configuration exceeds 128 KB.");
  if (!record(value)) fail("Expected a JSON object.");
  let config: Record<string, unknown> | undefined;
  if (value.config !== undefined) {
    if (!record(value.config)) fail("Configuration must be an object.");
    validateConfig(value.config);
    config = JSON.parse(JSON.stringify(value.config));
  }
  let code: string | undefined;
  if (value.code !== undefined && value.code !== "") {
    if (typeof value.code !== "string") fail("Appearance code must be text.");
    code = value.code.trim();
    if (code.length > format.share.MAX_CODE_CHARS + 4 || !/^JV(?:2:[A-Za-z0-9_-]+|1:[A-Za-z0-9+/]+=*)$/i.test(code)) fail("Paste a complete JV1 or JV2 appearance code (maximum 16,384 payload characters).");
  }
  if (!config && !code) fail("Provide an appearance configuration or code.");
  const yaw = value.yaw ?? 0;
  if (typeof yaw !== "number" || !Number.isFinite(yaw) || yaw < -180 || yaw > 360) fail("Yaw must be between -180 and 360 degrees.");
  const pitch = value.pitch ?? 0;
  if (typeof pitch !== "number" || !Number.isFinite(pitch) || pitch < -50 || pitch > 50) fail("Pitch must be between -50 and 50 degrees.");
  const outfit = value.outfit ?? "uniform", view = value.view ?? "full";
  if (!["uniform", "casual", "pinny"].includes(outfit as string)) fail("Unknown outfit mode.");
  if (!["full", "head"].includes(view as string)) fail("Unknown portrait view.");
  if (value.orbitAtlas !== undefined && typeof value.orbitAtlas !== "boolean") fail("Orbit atlas must be boolean.");
  return {config,code,yaw,pitch,outfit:outfit as LockerInput["outfit"],view:view as LockerInput["view"],orbitAtlas:value.orbitAtlas === true || undefined};
}
