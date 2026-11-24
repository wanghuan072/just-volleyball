import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = pageMetadata("/character-codes/how-to-create/");
export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Skins & Codes", href: "/skins/" },
          { name: "Create a Code", href: "/character-codes/how-to-create/" },
        ]}
      />
      <PageIntro
        title="Create Your Own Just Volleyball Character Code"
        description="Build a look in the game, then export it using the game’s sharing tools."
      />
      <Panel className={styles.article}>
        <h2>Export from the game</h2>
        <ol>
          <li>Customize your appearance in the Locker.</li>
          <li>Save it into one of the Locker&apos;s 50 preset slots, then choose Share.</li>
          <li>Use the player card&apos;s Copy code action.</li>
          <li>Save the complete original string somewhere safe.</li>
          <li>
            Keep a separate copy of your original player card if you use Save
            picture.
          </li>
        </ol>
        <h2>Check before sharing</h2>
        <p>
          Import your export into a spare preset and compare the appearance
          yourself. When sharing publicly, include the game version, a real
          preview, your creator name and the required accessories. Code export
          strips the display name; copying a code does not establish authorship
          or grant the recipient ownership of its items.
        </p>
        <h2>Keep the original card</h2>
        <p>
          Editing or cropping an exported card may remove the data used for
          picture imports. Keep the original separately from any decorative
          social-media image.
        </p>
        
        <p>
          <a href="/character-codes/how-to-import/">Read the import guide</a> or{" "}
          <a href="/legal/contact-us/">contact us about a correction</a>.
        </p>
      </Panel>
    </>
  );
}
