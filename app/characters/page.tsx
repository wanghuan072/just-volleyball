import Image from "next/image";
import { Breadcrumbs, Panel, SectionHeading } from "@/components/shared";
import media from "@/data/official-media.json";
import locker from "@/data/locker-catalog.json";
import shop from "@/data/shop-catalog.json";
import design from "@/styles/characters.module.css";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";

const title = "Just Volleyball Characters — Create Your Player";

const sections = [
  ["create", "Character Creator"],
  ["profile", "Player Profile"],
  ["career", "Career & Replays"],
  ["progression", "XP, Chips & Titles"],
  ["shop", "Shop"],
  ["awards", "Awards"],
  ["locker", "Locker"],
  ["questions", "FAQ"],
] as const;

export const metadata = pageMetadata("/characters/");

function GameScreenshot({ src, alt, width, height, caption, eager = false }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  eager?: boolean;
}) {
  const original = media.images.find(image => image.localPath === src)?.sourceUrl ?? src;
  return (
    <figure className={styles.characterScreenshot}>
      <a href={original} aria-label={`View full screenshot: ${alt}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 860px) 92vw, (max-width: 1440px) 53vw, 760px"
          loading={eager ? "eager" : "lazy"}
        />
      </a>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function Page() {
  return (
    <div className={design.page}>
      <Breadcrumbs items={[{ name: "Characters", href: "/characters/" }]} />

      <div className={design.hero}>
        <div className={styles.pageIntro}>
          <h1>{title}</h1>
          <p>You create your own volleyball player in the Locker. Your active profile keeps their appearance, title, and progress. Build a recognizable look, choose your uniform, and follow your progress from your first match onward.</p>
          <div className={design.actions}><a href="/tools/locker/">Create your character →</a><a href="/skins/">Explore character codes</a></div>
        </div>
        <GameScreenshot
          src="/images/game/locker.webp"
          alt="Just Volleyball Locker showing a player and uniform customization controls"
          width={1920}
          height={1080}
          caption="Personalize your player in the Locker"
          eager
        />
      </div>

      <nav className={styles.partsNav} aria-label="Character guide sections">
        {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section id="create" className={design.create}>
        <div className={design.heading}><h2>Just Volleyball Character Creator</h2><p>Start with your player, then build a look around them.</p></div>
        <div className={design.paths}>
          <a href="/tools/locker/"><h3>Create a character</h3><p>Adjust face features, body proportions, hair and uniform colors in the web Locker.</p><span>Open character creator →</span></a>
          <a href="/skins/"><h3>Just Volleyball Character Codes</h3><p>Browse community looks, open their details, and copy an appearance code to import.</p><span>Browse skins and codes →</span></a>
          <a href="/characters/shop/"><h3>Dress your player</h3><p>Try headwear, face accessories and extras. Check chip prices and title unlock requirements.</p><span>Explore the Shop →</span></a>
        </div>
        <div className={design.customize}>
          <div><h3>Make the character yours</h3><dl>
            <div><dt>Face & body</dt><dd>Skin tone, eyes, brows, nose, mouth, blush, height, build, head shape and ears.</dd></div>
            <div><dt>Hair & voice</dt><dd>Choose a hairstyle and facial hair, then set your player’s voice parameters.</dd></div>
            <div><dt>Uniforms</dt><dd>Set jersey number, colors, shirt pattern, shorts, socks and kneepads. Keep captain and gym outfits distinct.</dd></div>
            <div><dt>Accessories</dt><dd>Combine head, face and extra items. Imported looks can require items you still need to unlock.</dd></div>
          </dl><a href="/customization/">Explore customization options →</a></div>
          <div><h3>Find your hairstyle</h3><div className={design.hair}>{locker.hair.filter(hair => hair.id).slice(0, 8).map(hair => <a href="/tools/locker/" key={hair.id}><Image src={hair.image} alt={hair.label} width={160} height={160}/><span>{hair.label}</span></a>)}</div><p>{locker.hair.length} hair options, including bald · {locker.facialHair.length} facial hair options · {locker.kitStyles.length} uniform patterns in v{locker.gameVersion}</p></div>
        </div>
      </section>

      <section id="profile" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="users" title="Player Profile" />
          <div className={styles.characterFeatureGrid}>
            <GameScreenshot
              src="/images/game/character-profile.png"
              alt="Profile screen showing a custom player, the profile selector, and lifetime statistics"
              width={1763}
              height={910}
              caption="Sample player profile"
            />
            <div className={styles.characterGuideText}>
              <h3>Create and switch profiles</h3>
              <p>Open <strong>Profile</strong> from the main menu. Choose <strong>New</strong> to create a profile, use the dropdown to switch, or edit the name and choose <strong>Rename</strong>. Check the portrait and name in the main menu before playing if you share the game with another player.</p>
              <h3>Read your player stats</h3>
              <p>The profile shows your level, chips, and equipped title. Scroll the stats panel for totals such as wins, losses, points, spikes, blocks, receives, sets, assists, jumps, and playtime. To review a particular match, open <a href="#career">Career</a>.</p>
            </div>
          </div>
        </Panel>
      </section>

      <section id="career" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="book" title="Career & Match Replays" />
          <div className={styles.characterFeatureGrid}>
            <GameScreenshot
              src="/images/game/character-match.jpg"
              alt="Players in different uniforms leaping and diving during an indoor rally"
              width={1920}
              height={1080}
              caption="Indoor rally"
            />
            <div className={styles.characterGuideText}>
              <h3>Find recent matches</h3>
              <p>Open <strong>Career → Recent</strong> for your match history and overall wins, losses, and win rate. Sort by newest or oldest first. Version 1.0.3 keeps up to 50 recent entries per profile.</p>
              <h3>Keep a match and watch its replay</h3>
              <p>Open a match card to see its score and player stats. Choose <strong>Favorite</strong> to keep it under <strong>Favorites</strong>. Select <strong>Watch Replay</strong> when a replay file is available.</p>
            </div>
          </div>
        </Panel>
      </section>

      <section id="progression" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="tag" title="Levels, XP, Chips & Titles" />
          <p>Check the XP bar beside your portrait on the main menu. Eligible matches give experience and chips. The v1.0.3 progression rules award extra XP for a win and extra chips for a win or MVP.</p>
          <div className={styles.tableScroll}>
            <table className={styles.characterRewardTable}>
              <caption>XP and chip payouts in v1.0.3</caption>
              <thead><tr><th scope="col">Source</th><th scope="col">XP</th><th scope="col">Chips</th></tr></thead>
              <tbody>
                <tr><th scope="row">Rally played</th><td>3</td><td>3</td></tr>
                <tr><th scope="row">Set played</th><td>5</td><td>5</td></tr>
                <tr><th scope="row">Match win bonus</th><td>15</td><td>10</td></tr>
                <tr><th scope="row">MVP bonus</th><td>—</td><td>15</td></tr>
                <tr><th scope="row">Level up</th><td>400 XP required per level</td><td>150</td></tr>
                <tr><th scope="row">Claim a chip award</th><td>80% of its chip value, rounded</td><td>Amount shown on the award</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.sourceNote}>These are the base payouts. The match chip payout has a 75-chip minimum when at least 14 eligible rallies are recorded. </p>
          <h3>Unlock and equip a title</h3>
          <p>Open <strong>Profile → Edit Title</strong> to select an unlocked title. Choose a purchased or achievement-unlocked title for your player.</p>
        </Panel>
      </section>

      <section id="shop" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="tag" title="Spend Chips in the Shop" />
          <p>Open <strong>Shop</strong> from the main menu. The <strong>Head</strong>, <strong>Face</strong>, and <strong>Extras</strong> shelves sell accessories for your player. <strong>Titles</strong> lists chip purchases and achievement unlocks, with a separate <strong>Effects</strong> shelf for styling your title.</p>
          <div className={design.shopStats}>
            <div><strong>{locker.accessories.filter(item => item.availableInBuild && item.price > 0).length}</strong><span>Paid accessories</span></div>
            <div><strong>{shop.titles.length}</strong><span>Title entries</span></div>
            <div><strong>{shop.effects.length}</strong><span>Shop title effects</span></div>
          </div>
          <div className={design.paths}>{[
            ["Head", "Caps, helmets, hats and headwear"],
            ["Face", "Glasses, masks and face accessories"],
            ["Extras", "Capes, scarves and finishing touches"],
          ].map(([name, text]) => <div key={name}><h3>{name}</h3><p>{text}</p><strong>1,000 chips per paid accessory · v1.0.3</strong></div>)}</div>
          <p>Titles have individual prices or achievement requirements. Title effects style the nameplate. Preview an accessory in the Shop, then continue into the Locker with the selected item.</p>
          <a className={styles.primaryButton} href="/characters/shop/">Browse Shop items and prices <span aria-hidden="true">→</span></a>
        </Panel>
      </section>

      <section id="awards" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="check" title="Awards & Achievements" />
          <div className={styles.characterFeatureGrid}>
            <GameScreenshot
              src="/images/game/character-awards.png"
              alt="Awards screen with a daily claim, a reset timer, and two challenge goals"
              width={1763}
              height={910}
              caption="Daily awards and claim buttons"
            />
            <dl className={styles.characterFacts}>
              <div>
                <dt>Daily and Weekly</dt>
                <dd>Check the reset timer and the current goals. Examples include playing a match in Outer Space or making two diving receives in a row. Consecutive days can increase the Daily Claim reward.</dd>
              </div>
              <div>
                <dt>This Profile and Steam</dt>
                <dd><strong>This Profile</strong> tracks goals for the active profile. <strong>Steam</strong> displays Steam achievement status. Use the search field to locate an award by name.</dd>
              </div>
              <div>
                <dt>Collect rewards</dt>
                <dd>Use <strong>Claim</strong> beside an earned reward or <strong>Claim All</strong> when several are ready. In v1.0.3 a 125-chip award also grants 100 XP before any level-up bonus.</dd>
              </div>
            </dl>
          </div>
        </Panel>
      </section>

      <section id="locker" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="shirt" title="Build Your Player in the Locker" />
          <div className={styles.characterFeatureGrid}>
            <GameScreenshot
              src="/images/game/locker.webp"
              alt="Locker showing a green number 25 uniform with shorts, socks, and kneepad options"
              width={1920}
              height={1080}
              caption="Locker uniform editor"
            />
            <div className={styles.characterGuideText}>
              <h3>Set your appearance</h3>
              <p>Start with face, body, hair, and voice. The body panel also offers head shape, ears, and preferred hand. Add accessories and set up your <strong>Captain Uniform</strong> and <strong>Gym Outfit</strong> independently.</p>
              <h3>Preview and save</h3>
              <p>Switch the preview between outfits to check colors, shorts, socks, and kneepads. Use <strong>Save and Exit</strong> to apply the look to your active player. The full game also includes a Photo Studio within the Locker.</p>
              <a className={styles.smallLink} href="/tools/locker/">Open the web Locker <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </Panel>
      </section>

      <section id="questions" className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="book" title="Just Volleyball Characters FAQ" />
          <dl className={`${styles.characterFacts} ${styles.characterFactsRow}`}>
            <div>
              <dt>Who are the playable characters in Just Volleyball?</dt>
              <dd>Each player creates a custom avatar in the Locker. A name and title shown beside an avatar identify the player and their chosen title.</dd>
            </div>
            <div>
              <dt>How do I find my old matches?</dt>
              <dd>Look in <strong>Career → Recent</strong> for recent entries and <strong>Career → Favorites</strong> for saved ones. Open an entry to check whether its replay is available.</dd>
            </div>
            <div>
              <dt>Where do I change my title?</dt>
              <dd>Open <strong>Profile → Edit Title</strong> and select an unlocked title for the active profile.</dd>
            </div>
            <div>
              <dt>Can I earn XP without winning?</dt>
              <dd>Yes. Eligible rallies and sets contribute XP in v1.0.3. You can also earn XP by claiming awards with chip payouts.</dd>
            </div>
          </dl>
        </Panel>
      </section>

    </div>
  );
}

