import {
  Breadcrumbs,
  PageIntro,
  Panel,
  ImportSteps,
  Faq,
} from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = pageMetadata("/character-codes/how-to-import/");
export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Skins & Codes", href: "/skins/" },
          { name: "How to Import", href: "/character-codes/how-to-import/" },
        ]}
      />
      <PageIntro
        title="How to Import Character Codes in Just Volleyball"
        description="Bring a community-made look into your Locker with its original character code."
      />
      <Panel className={styles.article}>
        <p className={styles.notice}>
          Based on the game 1.0.3 Locker and importer scripts. Reviewed November
          23, 2026; not independently captured or tested in-game.
        </p>
        <h2>The short version</h2>
        <ImportSteps />
        <h2>Copy the complete preset</h2>
        <p>
          This game version accepts <code>JV2:</code> and legacy <code>JV1:</code>. Keep the prefix
          and every character after it together. Use the Copy Code button on a{" "}
          <a href="/skins/#character-codes">sourced preset</a> rather than
          transcribing a screenshot.
        </p>
        <h2>Open Locker → Presets → Import</h2>
        <p>
          In the game, enter the Locker and open Presets. Choose Import, paste
          the copied text and review any missing-items message. Check the resulting appearance before
          replacing a preset you want to keep.
        </p>
        <h2>Importing a player-card picture</h2>
        <p>
          The importer supports original player-card pictures. Exported PNGs can
          contain a jvlook text entry, and the importer also reads QR data. Keep
          the original file: cropping, converting or re-saving can lose that data.
          Gallery previews on this site are not offered as importable cards.
        </p>
        <h2>Missing accessories are not unlocked by a code</h2>
        <p>The game checks the imported look against your owned items. Unowned
          accessories can be removed when the look is worn. Preset detail pages
          list each unique required item and its game-coin price; repeated slots
          using one item do not require duplicate purchases. Importing preserves
          your current display name, title and level.</p>
        <h2>If the code is rejected</h2>
        <ul>
          <li>
            Copy it again from its original source, keeping the full prefix and
            body.
          </li>
          <li>
            Check whether the source shares a JV2 code or an older JV1 export.
          </li>
          <li>
            Compare your game version with any version named by the creator.
          </li>
          <li>
            Open the <a href="/tools/locker/">Locker</a> to import and preview the appearance code. Check required accessories before using the look in game.
          </li>
        </ul>
        
        <Faq
          items={[
            [
              "Is this a reward or unlock code?",
              "No. It carries appearance settings. It does not grant coins, shop items or supporter ownership.",
            ],
            [
              "Why is the imported look different?",
              "Review the required accessories first. The examined game removes unowned accessory items when wearing a look. Static format checks also do not guarantee identical rendering in later versions.",
            ],
            [
              "Can I create a code?",
              "Use the game’s own sharing/export feature. Read our creation guide; do not hand-write or alter an encoded preset.",
            ],
          ]}
        />
        <a className={styles.primaryButton} href="/skins/#character-codes">
          Browse character codes
        </a>
      </Panel>
    </>
  );
}
