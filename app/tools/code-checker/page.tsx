import { redirect } from "next/navigation";
import {
  Breadcrumbs,
  PageIntro,
  Panel,
  ImportSteps,
} from "@/components/shared";
import { CodeChecker } from "@/components/interactive";
import { metadata as makeMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = makeMetadata(
  "Just Volleyball Character Code Checker — JV1 / JV2 Decoder",
  "Decode Just Volleyball JV1 and JV2 appearance codes using game 1.0.3 checksum and field rules. Private browser processing with explicit import limits.",
  "/tools/code-checker/",
);
export default function Page() {
  redirect("/tools/");
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Tools", href: "/tools/" },
          { name: "Code Format Checker", href: "/tools/code-checker/" },
        ]}
      />
      <PageIntro
        title="Just Volleyball Code Format Checker"
        description="Check the checksum and decode appearance fields using the game 1.0.3 format. Rendering and accessory ownership remain separate checks."
      />
      <div className={styles.articleLayout}>
        <Panel>
          <CodeChecker />
        </Panel>
        <aside className={`${styles.panel} ${styles.sidebar}`}>
          <h2>Then test in-game</h2>
          <ImportSteps />
          <a href="/character-codes/how-to-import/">Full import guide</a>
        </aside>
      </div>
    </>
  );
}
