import Image from "next/image";
import { guides } from "@/lib/content";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/guides.module.css";

export const metadata = pageMetadata("/guides/");

export default function Page() {
  return <>
    <Breadcrumbs items={[{name:"Guides",href:"/guides/"}]} />
    <div className={styles.intro}>
      <PageIntro title="Just Volleyball Guides — Get Started & Play Together" description="From your first download to your first rally. Find the release details, learn your controls and get a game going with friends." />
      <a className={styles.primary} href="/guides/beginner/">Start with the beginner guide →</a>
    </div>
    <div className={styles.list}>
      {guides.map(guide => <a key={guide.slug} href={`/guides/${guide.slug}/`} className={styles.listCard}>
        <div className={styles.listCover}><Image src={guide.image} alt={guide.title} width={1920} height={1080} sizes="(max-width:700px) 90vw, 400px"/></div>
        <div className={styles.cardBody}><h2>{guide.title}</h2><p>{guide.description}</p><span>Read guide →</span></div>
      </a>)}
    </div>
  </>;
}
