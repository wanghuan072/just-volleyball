import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { listMetadata } from "@/lib/list-metadata";
import type { Query } from "@/lib/catalog";
import styles from "@/styles/site.module.css";

export function generateMetadata({ searchParams }: { searchParams: Promise<Query> }) {
  return listMetadata(
    "Just Volleyball Skins & Character Codes",
    "Browse community skins, filter by tag, preview each appearance and copy the matching Just Volleyball character code.",
    "/skins/",
    searchParams,
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Query> }) {
  return (
    <>
      <Breadcrumbs items={[{ name: "Skins & Codes", href: "/skins/" }]} />
      <PageIntro
        title="Just Volleyball Skins & Character Codes"
        description="Find a community look, see the required accessories, and copy its appearance code for the in-game Locker."
      />
      <Panel>
        <h2 id="character-codes">Just Volleyball Character Codes</h2>
        <Suspense fallback={<p role="status">Loading community skins…</p>}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </Panel>
      <Panel className={styles.skinHelp}>
        <h2>Customize Your Just Volleyball Character</h2>
        <h3>How to Use Just Volleyball Skins Codes</h3>
        <p>Copy a code and open <strong>Locker → Presets → Import</strong> in the game. Review the required accessories before applying the appearance.</p>
        <div className={styles.actions}>
          <a className={styles.secondaryButton} href="/character-codes/how-to-import/">Read the import guide</a>
          <a className={styles.secondaryButton} href="/tools/locker/">Open Player Locker</a>
        </div>
      </Panel>
    </>
  );
}
