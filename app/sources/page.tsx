import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = pageMetadata("/sources/");
export default function Page() { return <>
  <Breadcrumbs items={[{name:"Compatibility & Credits",href:"/sources/"}]}/>
  <PageIntro title="Just Volleyball Compatibility & Credits" description="Check what can change an imported look and how to request a correction to an appearance or creator credit."/>
  <Panel className={styles.article}>
    <h2>Appearance codes and owned items</h2><p>A character code describes a combination of face, hair, clothing and accessories. It does not unlock items or grant currency. Check the accessories listed on the look’s detail page before importing it.</p>
    <h2>Why a look can differ in game</h2><p>Game versions, lighting, team uniforms and owned accessories can affect the result. The web preview helps you inspect the combination, but a compatibility check does not establish that every appearance has been independently imported in a live Steam match.</p>
    <h2>Community names and credits</h2><p>Named outfits are player-created interpretations. They do not establish an official character roster or endorsement. Each look retains its creator information where available. Contact us if a credit is incorrect or a work requires review.</p>
    <h2>Game information and updates</h2><p>Historical release dates describe past events. Development targets may change. Follow the current patch notes and your in-game settings when checking whether a feature is available.</p>
    <h2>Report a correction</h2><p>Email support@justvolleyball.app with the page, the affected look or instruction, your game version and what happened. Include only information relevant to the issue.</p>
    <p><a href="/legal/copyright/">Copyright and ownership information</a> · <a href="/legal/contact-us/">Contact us</a></p>
  </Panel>
</>; }
