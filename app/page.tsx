import Image from "next/image";
import { Suspense } from "react";
import { skins, guides, updates } from "@/lib/content";
import { gameInfo } from "@/data/game-info";
import { pageMetadata } from "@/lib/site";
import { Icon } from "@/components/icon";
import { SectionHeading, Panel, ImportSteps, Faq, SkinCard, JsonLd } from "@/components/shared";
import { CopyButton } from "@/components/interactive";
import { GuideCard, UpdateCard } from "@/components/cards";
import { PriceFact } from "@/components/steam-widgets";
import styles from "@/styles/site.module.css";

export const metadata = pageMetadata("/");

const questions: [string, string][] = [
  ["What is Just Volleyball?", "Just Volleyball is temkosoft’s arcade volleyball game for Windows PC on Steam. Move your player manually, aim contacts with the cursor, and play online or offline in formats from 1v1 to 6v6."],
  ["Is Just Volleyball out, and where can I buy it?", "The game released on November 16, 2026. Open its Steam listing to buy or install it. The Updates page includes Release & Price information with a timestamp for the available US price reading."],
  ["Can I still play the Just Volleyball demo?", "The November Encore Demo was a limited event. Check the official Steam page for a current demo download option. An old demo in your library does not confirm that access is still open."],
  ["Are the named skins playable characters?", "The game lets players create their own avatars. Names in our skins collection describe community-created looks inspired by those characters. You can open each look to inspect its picture, code and required accessories."],
  ["How do I import Just Volleyball character codes?", "Copy a look’s code, open the in-game Locker, choose Presets and select Import. Paste the code, review the preview and any required items, then confirm. The import guide also explains player-card pictures."],
  ["Does importing a code unlock accessories?", "A code describes an appearance. Your game profile still needs to own the required accessories, and an older build may lack some items. Check the listed requirements before importing."],
  ["What can I do in the web Locker?", "Adjust your player’s face, body, hair, outfits and accessories, rotate the preview, save a look and export its appearance code. You can also try Shop items and continue editing the combination in the Locker."],
  ["How do I play with friends?", "Use compatible updated versions and create a party or custom lobby. The Online guide covers invitations, server browsing, LAN, local play and Steam Remote Play Together."],
];

export default function Home() {
  const featured = skins[0];
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Just Volleyball<span> — Skins, Codes &amp; Guides</span></h1>
          <Icon name="ball" className={styles.titleBall} />
          <p>Skins, character codes, guides and the Locker<br />for Just Volleyball players.</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/skins/"><Icon name="shirt" />Browse Skins</a>
            <a className={styles.secondaryButton} href="/guides/"><Icon name="book" />View Guides</a>
          </div>
        </div>
        <div className={`${styles.heroVisual} ${styles.officialHero}`}>
          <Image src="/images/game/steam-arena.webp" alt="Just Volleyball players on the indoor court" fill sizes="(max-width:768px) 90vw, 620px" preload />
          <a className={styles.officialCaption} href="/guides/beginner/">Learn your first rally →</a>
          <Icon name="ball" className={styles.heroBall} />
        </div>
      </section>

      <section className={styles.quickFacts} aria-label="Game quick facts">
        <a className={styles.fact} href="/guides/demo/"><Icon name="download" /><div><strong>Demo</strong><span>Access, outfits &amp; history</span></div></a>
        <a className={styles.fact} href="/guides/release-date/"><Icon name="calendar" /><div><strong>Released</strong><span>{gameInfo.releaseLabel}</span></div></a>
        <Suspense fallback={<a className={styles.fact} href="/updates/#release-price"><Icon name="tag" /><div><strong>Price</strong><span>Check Steam pricing</span></div></a>}><PriceFact /></Suspense>
        <a className={styles.fact} href="/discord/"><Icon name="users" /><div><strong>Discord</strong><span>Join the community</span></div></a>
        <a className={styles.fact} href="/guides/online/"><Icon name="users" /><div><strong>Multiplayer</strong><span>Online, LAN &amp; friends</span></div></a>
        <a className={styles.fact} href="/updates/#release-price"><Icon name="steam" /><div><strong>Platforms</strong><span>{gameInfo.confirmedPlatform}</span></div></a>
      </section>

      <div className={styles.homeRow}>
        <Panel>
          <SectionHeading icon="shirt" title="Featured Looks" href="/skins/" label="All skins & codes" />
          <div className={styles.featuredGrid}>{skins.slice(0,6).map(skin=><SkinCard key={skin.id} skin={skin} compact />)}</div>
        </Panel>
        <Panel>
          <SectionHeading icon="code" title="Character Codes" href="/skins/#character-codes" label="All codes" />
          <div className={styles.codeFeature}>
            <div className={styles.codeBox}>
              {featured && <><strong>{featured.name} community look</strong><p>Browse a look, review its accessories, then copy the appearance code.</p><CopyButton code={featured.code} /><a className={styles.smallLink} href={`/skins/${featured.slug}/`}>View look &amp; requirements</a></>}
            </div>
            <div className={styles.importBox}>
              <h3><Icon name="download" />How to import</h3>
              <ImportSteps />
              <a href="/character-codes/how-to-import/">Codes, pictures &amp; required items</a>
            </div>
          </div>
        </Panel>
      </div>

      <div className={`${styles.homeRow} ${styles.homeRowAlt}`}>
        <Panel>
          <SectionHeading icon="book" title="Guides" href="/guides/" label="All guides" />
          <div className={styles.guideGrid}>{guides.map(guide=><GuideCard key={guide.slug} guide={guide} />)}</div>
        </Panel>
        <Panel>
          <SectionHeading icon="tool" title="Tools" href="/tools/" label="All tools" />
          <div className={styles.toolGrid}>
            <a className={styles.toolCard} href="/tools/locker/"><Icon name="shirt" /><div><h3>Player Locker</h3><p>Mix faces, hair, uniforms and accessories. Rotate your player, save a look and export its code.</p></div></a>
          </div>
        </Panel>
      </div>

      <Panel className={styles.updatesPanel}>
        <SectionHeading icon="news" title="Updates" href="/updates/" label="All updates" />
        <div className={styles.updateGrid}>{updates.slice(0,3).map(update=><UpdateCard key={update.slug} update={update} compact />)}</div>
      </Panel>

      <Panel className={styles.homeAbout}>
        <SectionHeading icon="ball" title="About Just Volleyball" href="/legal/about-us/" label="About this site" />
        <div className={styles.homeAboutBody}>
        <p>Just Volleyball is temkosoft’s arcade volleyball game for Windows PC on Steam. Move manually, aim with the cursor and play online or offline in formats from 1v1 to 6v6.</p>
        <p>Explore community skins and character codes, customize a player in the <a href="/tools/locker/">Locker</a>, and try accessories in the <a href="/characters/shop/">Shop</a>. Our <a href="/characters/">Characters guide</a> covers profiles, XP, chips, titles and rewards.</p>
        <p>Start with the <a href="/guides/beginner/">Beginner guide</a>, check your <a href="/guides/controls/">Controls</a>, or learn to <a href="/guides/online/">play with friends</a>. Visit <a href="/updates/#release-price">Release &amp; Price</a> for game availability and pricing information.</p>
        </div>
      </Panel>

      <Panel className={styles.homeQuestions}>
        <Faq items={questions} />
      </Panel>
      <JsonLd data={{"@context":"https://schema.org","@type":"FAQPage",mainEntity:questions.map(([name,text])=>({"@type":"Question",name,acceptedAnswer:{"@type":"Answer",text}}))}} />
    </div>
  );
}
