"use client";

import { useEffect, useRef, useState } from "react";
import assets from "@/data/locker-studio-assets.json";
import { embedAppearanceCodeInPng } from "@/lib/appearance-png";
import { orbitCell, type Orbit, type OrbitAtlas } from "@/lib/orbit-atlas";
import styles from "@/styles/locker.module.css";

const shapes = { square: [1024, 1024], wide: [1280, 720], tall: [1080, 1920] } as const;
const patterns = assets.patterns;
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new window.Image(); img.onload = () => resolve(img); img.onerror = () => reject(Error("Could not load a card image.")); img.src = src; });
}

export function LockerCardStudio({ image, code, disabled, atlas, orbit }: {
  image?: string; code?: string; disabled: boolean; atlas?: OrbitAtlas; orbit: Orbit;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shape, setShape] = useState<keyof typeof shapes>("square");
  const [background, setBackground] = useState("ffd83f");
  const [pattern, setPattern] = useState("");
  const [opacity, setOpacity] = useState(0.2);
  const [sticker, setSticker] = useState("");
  const [stickerX, setStickerX] = useState(0.8);
  const [stickerY, setStickerY] = useState(0.2);
  const [stickerSize, setStickerSize] = useState(0.2);
  const [portraitX, setPortraitX] = useState(0.5);
  const [portraitY, setPortraitY] = useState(0.48);
  const [portraitSize, setPortraitSize] = useState(0.8);
  const [name, setName] = useState("my player");
  const [textColor, setTextColor] = useState("ffffff");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Render a player first to compose a card.");
  const [exporting, setExporting] = useState(false);
  const [width, height] = shapes[shape];
  const source = atlas?.image ?? image;
  const cell = atlas && orbitCell(atlas, orbit);
  const sx = atlas && cell ? cell.column * atlas.width : undefined;
  const sy = atlas && cell ? cell.row * atlas.height : undefined;
  const sw = atlas?.width;
  const sh = atlas?.height;

  useEffect(() => {
    let cancelled = false;
    const target = canvas.current;
    if (!target) return;
    async function paint() {
      setReady(false);
      try {
        const selectedSticker = assets.stickers.find(item => item.id === sticker);
        const selectedPattern = patterns.find(item => item.id === pattern);
        const [portrait, stamp, texture] = await Promise.all([
          source ? loadImage(source) : Promise.resolve(null),
          selectedSticker ? loadImage(selectedSticker.image) : Promise.resolve(null),
          selectedPattern?.image ? loadImage(selectedPattern.image) : Promise.resolve(null),
          document.fonts.load("900 80px LockerNunito"),
        ]);
        if (cancelled || !target) return;
        const ctx = target.getContext("2d");
        if (!ctx) throw Error("Canvas is unavailable in this browser.");
        target.width = width; target.height = height;
        ctx.fillStyle = `#${background}`; ctx.fillRect(0, 0, width, height);
        if (texture) { const fill = ctx.createPattern(texture, "repeat"); if (fill) { ctx.globalAlpha = opacity; ctx.fillStyle = fill; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; } }
        if (portrait) {
          const h = height * portraitSize;
          const w = h * (sw ?? portrait.width) / (sh ?? portrait.height);
          const left = width * portraitX - w / 2;
          const top = height * portraitY - h / 2;
          if (sx !== undefined && sy !== undefined && sw && sh) {
            ctx.drawImage(portrait, sx, sy, sw, sh, left, top, w, h);
          } else {
            ctx.drawImage(portrait, left, top, w, h);
          }
        }
        if (stamp) { const w = Math.min(width, height) * stickerSize; const h = w * stamp.height / stamp.width; ctx.drawImage(stamp, width * stickerX - w / 2, height * stickerY - h / 2, w, h); }
        if (name) { const size = Math.min(width, height) * 0.065; ctx.font = `900 ${size}px LockerNunito, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.lineWidth = size * 0.15; ctx.strokeStyle = "#252e3e"; ctx.strokeText(name, width / 2, height * 0.92, width * 0.9); ctx.fillStyle = `#${textColor}`; ctx.fillText(name, width / 2, height * 0.92, width * 0.9); }
        setReady(Boolean(portrait)); setMessage(portrait ? "Card preview ready" : "Render a player first to compose a card.");
      } catch (error) { if (!cancelled) { setReady(false); setMessage(error instanceof Error ? error.message : "Card preview failed."); } }
    }
    void paint(); return () => { cancelled = true; };
  }, [source, sx, sy, sw, sh, shape, width, height, background, pattern, opacity, sticker, stickerX, stickerY, stickerSize, portraitX, portraitY, portraitSize, name, textColor]);

  async function exportCard() {
    if (!canvas.current || !code || disabled || !ready) return;
    setExporting(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.current!.toBlob(value => value ? resolve(value) : reject(Error("Could not export the card.")), "image/png"));
      const bytes = embedAppearanceCodeInPng(new Uint8Array(await blob.arrayBuffer()), code);
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
      const link = document.createElement("a"); link.href = url; link.download = "just-volleyball-player-card.png"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Player card exported with its embedded appearance code.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Card export failed."); } finally { setExporting(false); }
  }
  function slider(label: string, value: number, change: (value: number) => void, min = 0, max = 1) { return <label className={styles.control}><span>{label}</span><div className={styles.range}><input type="range" min={min} max={max} step="0.02" value={value} onChange={e => change(Number(e.target.value))} /><output>{Math.round(value * 100)}%</output></div></label>; }
  return <div className={styles.cardStudio}>
    <p>Compose a player card with original game patterns and stickers. This web card composer does not reproduce every layer tool in the game’s Studio.</p>
    <canvas ref={canvas} className={styles.cardCanvas} width={width} height={height} role="img" aria-label="Player card composition preview" />
    <p role="status">{disabled ? "Update your player preview before exporting this card." : message}</p>
    <label className={styles.control}><span>Card shape</span><select value={shape} onChange={e => setShape(e.target.value as keyof typeof shapes)}>{Object.entries(shapes).map(([id, dimensions]) => <option key={id} value={id}>{id} · {dimensions.join(" × ")}</option>)}</select></label>
    <label className={styles.control}><span>Background</span><input type="color" value={`#${background}`} onChange={e => setBackground(e.target.value.slice(1))} /></label>
    <label className={styles.control}><span>Pattern</span><select value={pattern} onChange={e => setPattern(e.target.value)}><option value="">Solid colour</option>{patterns.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {pattern && slider("Pattern opacity", opacity, setOpacity)}
    <label className={styles.control}><span>Player name</span><input value={name} maxLength={40} onChange={e => setName(e.target.value)} /></label>
    <label className={styles.control}><span>Name colour</span><input type="color" value={`#${textColor}`} onChange={e => setTextColor(e.target.value.slice(1))} /></label>
    {slider("Portrait size", portraitSize, setPortraitSize, 0.2, 1.6)}{slider("Portrait horizontal", portraitX, setPortraitX)}{slider("Portrait vertical", portraitY, setPortraitY)}
    <label className={styles.control}><span>Game sticker</span><select value={sticker} onChange={e => setSticker(e.target.value)}><option value="">None</option>{assets.stickers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {sticker && <>{slider("Sticker size", stickerSize, setStickerSize, 0.06, 0.7)}{slider("Sticker horizontal", stickerX, setStickerX)}{slider("Sticker vertical", stickerY, setStickerY)}</>}
    <button className={styles.primary} disabled={disabled || !ready || !code || exporting} onClick={() => void exportCard()}>{exporting ? "Exporting…" : "Download player card PNG"}</button>
    <p className={styles.note}>The card embeds the game appearance code as PNG metadata. All composition and export happen in your browser.</p>
  </div>;
}
