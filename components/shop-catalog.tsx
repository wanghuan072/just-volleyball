"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";
import { frontOrbit } from "./preview-orbit";
import dynamic from "next/dynamic";
const LocalPlayerPreview = dynamic(() => import("./local-player-preview").then(module => module.LocalPlayerPreview), { ssr: false });
import { decodeLocalLook } from "@/lib/local-look";
import { lockerHref, shopHref, tryOnAccessory, type AccessoryCategory } from "@/lib/shop-look";
import styles from "@/styles/shop.module.css";

const categories = [
  ["head", "Head", "shirt"],
  ["face", "Face", "users"],
  ["extra", "Extras", "tag"],
  ["title", "Titles", "news"],
  ["effect", "Title effects", "ball"],
] as const;

export type ShopItem = {
  id: string;
  name: string;
  category: (typeof categories)[number][0];
  price: number | null;
  requirement?: string;
};

export type ShopLook = {
  slug: string;
  name: string;
  code: string;
  image: string;
  width: number;
  height: number;
  bounds: number[];
  accessories: string[];
};

type Portrait = {
  image: string;
  width: number;
  height: number;
  alphaBounds: number[];
  config: Record<string, unknown>;

};
type Context = { look: string; code: string };
const pageSize = 24;
const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const chips = new Intl.NumberFormat("en-US");

function isAccessory(item: ShopItem): item is ShopItem & { category: AccessoryCategory } {
  return item.category === "head" || item.category === "face" || item.category === "extra";
}

async function renderPortrait(payload: Record<string, unknown>): Promise<Portrait> {
  const config = payload.code ? await decodeLocalLook(String(payload.code)) : payload.config as Record<string, unknown>;
  return { config, image: "", width: 960, height: 1240, alphaBounds: [0, 0, 960, 1240] };
}

function ChipPrice({ item }: { item: ShopItem }) {
  if (item.price === null) return <span className={styles.earned}>Achievement</span>;
  return <span className={styles.price}><span aria-hidden="true">◆</span> {chips.format(item.price)} chips</span>;
}

export function ShopCatalog({ items, looks, baseConfig }: {
  items: ShopItem[];
  looks: ShopLook[];
  baseConfig: Record<string, unknown>;
}) {
  const [context, setContext] = useState<Context>({ look: "", code: "" });
  const [category, setCategory] = useState<ShopItem["category"]>("head");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [requiredOnly, setRequiredOnly] = useState(false);
  const [earnedOnly, setEarnedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [preview, setPreview] = useState<Portrait | null>(null);
  const [orbit, setOrbit] = useState(frontOrbit);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [status, setStatus] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLElement>(null);
  const renderQueue = useRef(Promise.resolve());
  const imported = useRef<{ code: string; config: Record<string, unknown> } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const look = looks.find(candidate => candidate.slug === params.get("look"));
    const item = items.find(candidate => isAccessory(candidate) && candidate.id === params.get("item"));
    const code = params.get("code") ?? "";
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setContext({ look: look?.slug ?? "", code: code.length <= 16388 ? code : "" });
      if (item) {
        setCategory(item.category);
        setSelected(item);
        setQuery(item.name);
      } else if (look?.accessories.length) {
        setRequiredOnly(true);
      }
    });
    return () => { active = false; };
  }, [items, looks]);

  const look = looks.find(candidate => candidate.slug === context.look);
  const code = look?.code ?? context.code;
  const accessory = selected && isAccessory(selected) ? selected : null;
  const backView = Math.abs(orbit.yaw) > 90;
  const needsRender = Boolean(accessory || code);


  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setBusy(needsRender);
      setPreviewError(false);
      setStatus(needsRender ? "Updating player…" : "");
      if (!needsRender) setPreview(null);
    });
    if (needsRender) {
      // Ignore obsolete selections while decoding the selected local look.
      renderQueue.current = renderQueue.current.then(async () => {
        if (!active) return;
        try {
          let result: Portrait;
          let replaced = false;
          if (accessory && isAccessory(accessory)) {
            let config = baseConfig;
            if (code) {
              const saved = imported.current;
              if (saved?.code === code) {
                config = saved.config;
              } else {
                const decoded = await renderPortrait({ code });
                config = decoded.config;
                imported.current = { code, config };
              }
              if (!active) return;
            }
            const applied = tryOnAccessory(config, accessory.id, accessory.category);
            if (!applied) throw new Error("No slot available for this accessory. Edit its slots in Locker.");
            result = await renderPortrait({ config: applied.config });
            replaced = applied.replaced;
          } else {
            result = await renderPortrait(code ? { code } : { config: baseConfig });
            if (code) imported.current = { code, config: result.config };
          }
          if (!active) return;
          setPreview(result);
          setStatus(replaced ? "Preview replaces the last item in this category." : "");
        } catch (error) {
          if (active) {
            setPreviewError(true);
            setStatus(error instanceof Error ? error.message : "Unable to update the player preview.");
          }
        } finally {
          if (active) setBusy(false);
        }
      });
    }
    return () => { active = false; };
  }, [accessory, baseConfig, code, needsRender, retry]);

  const requirements = items.filter(item => isAccessory(item) && look?.accessories.includes(item.id));
  const total = requirements.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const related = selected && isAccessory(selected)
    ? looks.filter(candidate => candidate.accessories.includes(selected.id))
    : [];

  const needle = query.trim().toLowerCase();
  const filtered = items.filter(item =>
    (requiredOnly ? isAccessory(item) && look?.accessories.includes(item.id) : item.category === category) &&
    (!earnedOnly || item.price === null) &&
    (!needle || [item.name, item.id, item.requirement].some(value => value?.toLowerCase().includes(needle))),
  );
  const results = sort === "default" ? filtered : filtered.sort((a, b) => {
      const byName = collator.compare(a.name, b.name);
      if (sort === "name") return byName;
      if (a.price === null || b.price === null) return Number(a.price === null) - Number(b.price === null) || byName;
      return (sort === "high" ? b.price - a.price : a.price - b.price) || byName;
  });
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const start = (page - 1) * pageSize;

  function changeShelf(next: ShopItem["category"]) {
    setCategory(next);
    setRequiredOnly(false);
    setEarnedOnly(false);
    setQuery("");
    changePage(1);
  }

  function changePage(next: number) {
    setPage(next);
    if (list.current) list.current.scrollTop = 0;
  }

  function selectItem(item: ShopItem) {
    if (item.id === selected?.id && item.category === selected.category) return;
    setPreview(null);
    setSelected(item);
    if (window.matchMedia("(max-width: 760px)").matches) {
      player.current?.scrollIntoView({ block: "start" });
    }
  }

  function turnPlayer() {
    setOrbit(current => ({ ...current, yaw: backView ? 0 : -180 }));
  }

  return (
    <div className={styles.shop}>
      <div className={styles.rail} role="group" aria-label="Shop categories">
        {categories.map(([id, label, icon]) => (
          <button key={id} type="button" aria-pressed={!requiredOnly && category === id} onClick={() => changeShelf(id)}>
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </div>

      <section ref={player} className={styles.preview} aria-label="Player try-on">
        <h1>Just Volleyball Shop</h1>
        <div className={styles.lookBar}>
          <label>Preview player
            <select value={look?.slug ?? (context.code ? "locker" : "")} onChange={event => {
              setPreview(null);
              const slug = event.target.value;
              setContext(current => ({ ...current, look: slug === "locker" ? "" : slug, code: slug === "locker" ? current.code : "" }));
              setRequiredOnly(false);
              changePage(1);
            }}>
              <option value="">Default player</option>
              {context.code ? <option value="locker">Your Locker look</option> : null}
              {looks.map(entry => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
            </select>
          </label>
          <a href="/skins/">Browse skins</a>
        </div>
        <div className={styles.stage} aria-busy={busy}>
          <LocalPlayerPreview config={preview?.config ?? baseConfig} orbit={orbit} onOrbit={setOrbit} onError={setStatus} />
          <button className={styles.turnPlayer} type="button"
            onClick={turnPlayer}
            aria-label={backView ? "Show front of player" : "Show back of player"}>
            <span aria-hidden="true">↻ {backView ? "Front view" : "Back view"}</span>
          </button>
          {selected?.category === "title" ? <span className={styles.playerTitle}>{selected.name}</span> : null}
        </div>

        <div className={styles.selection}>
          {selected ? (
            <>
              <div><strong>{selected.name}</strong> <ChipPrice item={selected} /></div>
              {selected.requirement ? <p>{selected.requirement}</p> : null}
              {isAccessory(selected) ? (
                <div className={styles.actions}>
                  <a href={lockerHref(code, selected.id)}>Open in Locker</a>
                </div>
              ) : <p>{selected.category === "effect" ? "Equip purchased effects in the in-game title editor." : "Equip unlocked titles in Profile → Edit Title."}</p>}
            </>
          ) : (
            <div className={styles.actions}>
              <span>Select a shop item to preview</span>
              <a href={lockerHref(code)}>Open Locker</a>
            </div>
          )}
          <p className={styles.status} role="status">{status}</p>
          <p className={styles.orbitHint}>Drag to rotate and tilt</p>
          {previewError ? <button type="button" onClick={() => setRetry(current => current + 1)}>Retry preview</button> : null}
        </div>
      </section>

      <section className={styles.shelf} aria-label="Shop inventory">
        <header className={styles.shelfHeader}>
          <h2>{requiredOnly ? "Required accessories" : categories.find(([id]) => id === category)?.[1]}</h2>
          {look && requirements.length ? (
            <div className={styles.requirements}>
              <a href={`/skins/${look.slug}/`}>{look.name}</a>
              <button type="button" aria-pressed={requiredOnly} onClick={() => {
                setRequiredOnly(!requiredOnly);
                setEarnedOnly(false);
                setQuery("");
                changePage(1);
              }}>{requirements.length} required · {chips.format(total)} chips</button>
            </div>
          ) : null}
          <div className={styles.controls}>
            <input aria-label="Search Shop" type="search" placeholder="Search items" value={query} onChange={event => {
              setQuery(event.target.value);
              changePage(1);
            }} />
            <select aria-label="Sort Shop" value={sort} onChange={event => {
              setSort(event.target.value);
              changePage(1);
            }}>
              <option value="default">Default order</option>
              <option value="low">Price low to high</option>
              <option value="high">Price high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          {category === "title" && !requiredOnly ? <label className={styles.achievementFilter}>
            <input type="checkbox" checked={earnedOnly} onChange={event => {
              setEarnedOnly(event.target.checked);
              changePage(1);
            }} /> Achievement titles only
          </label> : null}
        </header>
        <div ref={list} className={styles.scroll}>
          {results.length ? (
            <div className={styles.grid}>
              {results.slice(start, start + pageSize).map(item => (
                <button key={`${item.category}/${item.id}`} type="button"
                  aria-pressed={item.id === selected?.id && item.category === selected.category}
                  className={styles.item} onClick={() => selectItem(item)}>
                  {isAccessory(item) ? (
                    <Image src={`/images/shop/${item.id}.webp`} width={240} height={240} unoptimized alt={`${item.name} accessory preview`} aria-hidden="true" />
                  ) : <span className={styles.titleTile}>{item.name}</span>}
                  {isAccessory(item) ? <strong>{item.name}</strong> : null}
                  <ChipPrice item={item} />
                </button>
              ))}
            </div>
          ) : <p className={styles.empty}>No items match your search.</p>}
        </div>
        <footer className={styles.shelfFooter}>
          <span aria-live="polite">{results.length} items</span>
          {pageCount > 1 ? (
            <div className={styles.actions}>
              <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button>
              <span>{page} / {pageCount}</span>
              <button type="button" disabled={page === pageCount} onClick={() => changePage(page + 1)}>Next</button>
            </div>
          ) : null}
        </footer>
        {related.length ? (
          <div className={styles.related}>
            <h3>Looks that use {selected?.name}</h3>
            <ul>{related.slice(0, 4).map(entry => <li key={entry.slug}><a href={shopHref(entry.slug, selected?.id)}>{entry.name}</a></li>)}</ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
