import { Suspense } from "react";
import { updates } from "@/lib/content";
import { getNews } from "@/lib/news";
import { getPrice } from "@/lib/steam";
import { gameInfo } from "@/data/game-info";
import { pageMetadata, dateLabel } from "@/lib/site";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import styles from "@/styles/updates.module.css";

export const metadata = pageMetadata("/updates/");

async function ReleasePrice() {
  const { price, cached, fetchedAt } = await getPrice();
  return (
    <section id="release-price" className={styles.section}>
      <header><h2>Release &amp; Price</h2><span>Game information</span></header>
      <ul className={styles.facts}>
        <li><strong>Release date</strong><span>{gameInfo.releaseLabel}</span></li>
        <li><strong>Platform</strong><span>Windows PC · Steam</span></li>
        <li><strong>Developer</strong><span>{gameInfo.developer}</span></li>
        <li><strong>{cached ? "Last recorded US price" : "US Steam price"}</strong><span>{price ? price.final_formatted : "Check Steam for current pricing"}{price && price.discount_percent > 0 ? ` · ${price.discount_percent}% off` : ""}</span></li>
      </ul>
      {fetchedAt && <p className={styles.note}>Price checked {dateLabel(fetchedAt)} · USD · Prices and promotions vary by region.</p>}
      <h3>What arrived with the full release</h3>
      <ul className={styles.changes}>
        <li><strong>Save data and character creation</strong><p>Steam Cloud support for save data and the Photo Studio inside the Locker joined the full-release feature set. Customize a player, save appearances and create player pictures.</p></li>
        <li><strong>Courts and environments</strong><p>Nationals Arena, Clouds and Space expanded the map selection. Court variations include evening and night versions of grass and beach environments.</p></li>
        <li><strong>Progression and rewards</strong><p>The release announcement listed more than 60 achievements and awards, daily and weekly goals, and more than 500 unlockable titles. Your profile tracks progress while the Shop and Locker handle appearance choices.</p></li>
        <li><strong>Custom lobbies</strong><p>Lobby modifiers include sweat, player collisions, ball indicators and CPU fill. Hosts can configure a match around the experience their group wants.</p></li>
        <li><strong>Online and offline play</strong><p>Play formats range from 1v1 to 6v6. Practice with bots offline or join online games, and use replay mode to review highlights and capture match moments.</p></li>
        <li><strong>Launch promotion</strong><p>The November 16 announcement described a 38% launch discount lasting approximately eight days. Check the price above and the Steam store for the offer currently available in your region.</p></li>
      </ul>
      <div className={styles.related}><a href="/characters/">Player profiles &amp; rewards →</a><a href="/tools/locker/">Create a player →</a><a href="/characters/shop/">Explore the Shop →</a></div>
      <a className={styles.link} href="https://store.steampowered.com/app/5037200/">View on Steam →</a>
    </section>
  );
}

const groups = [
  { id: "patches", title: "Patch Notes & Fixes", label: "Released", items: updates.filter(item => item.version || item.slug === "controller-fixes") },
  { id: "gameplay", title: "Gameplay & Player Tips", label: "Player guidance", items: updates.filter(item => item.slug === "new-player-tips") },
  { id: "upcoming", title: "Upcoming Updates", label: "Planned", items: updates.filter(item => item.slug === "future-updates-ranked-music") },
];

async function Announcements() {
  const data = await getNews();
  const known = new Set(updates.map(item => item.title));
  const items = data.items.filter(item => !known.has(item.title));
  if (!items.length) return null;
  return <section id="announcements" className={styles.section}>
    <header><h2>More Announcements</h2><span>{data.cached ? "Saved announcements" : "Latest announcements"}</span></header>
    <ul className={styles.announcements}>{items.map(item => <li key={item.id}><time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time><a href={item.url}>{item.title} ↗</a></li>)}</ul>
  </section>;
}

export default function Page() {
  return <>
    <Breadcrumbs items={[{ name: "Updates", href: "/updates/" }]} />
    <PageIntro title="Just Volleyball Updates — Patch Notes & News" description="Catch up on patch notes, player tips, release information and what’s coming next." />
    <nav className={styles.nav} aria-label="Update sections">
      <a href="#release-price">Release &amp; Price</a>
      {groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}</a>)}
    </nav>
    <div className={styles.layout}>
      <Suspense fallback={<section id="release-price" className={styles.section}><h2>Release &amp; Price</h2><p role="status">Checking Steam pricing…</p></section>}><ReleasePrice /></Suspense>
      {groups.map(group => <section key={group.id} id={group.id} className={styles.section}>
        <header><h2>{group.title}</h2><span>{group.label}</span></header>
        {group.id === "upcoming" && <p className={styles.note}>The November 22 development update describes the plans below. Any timing is a target and remains subject to testing and development.</p>}
        <ul className={styles.entries}>{group.items.map(item => <li key={item.slug} id={item.slug}>
          <div className={styles.meta}><time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time>{item.version && <span>v{item.version}</span>}</div>
          <div><h3>{item.version ? `Patch ${item.version}` : item.slug === "future-updates-ranked-music" ? "Ranked, music & stability improvements" : item.slug === "new-player-tips" ? "New player tips & tricks" : item.title}</h3>
            <p className={styles.note}>{item.summary}</p>
            <ul className={styles.changes}>{item.content.map(change => <li key={change.heading}><strong>{change.heading}</strong><p>{change.text}</p></li>)}</ul>
          </div>
        </li>)}</ul>
      </section>)}
      <Suspense fallback={null}><Announcements /></Suspense>
    </div>
  </>;
}
