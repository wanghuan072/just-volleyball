import Image from "next/image";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/tools.module.css";

export const metadata = pageMetadata("/tools/");

const tools = [
  {
    href: "/tools/locker/",
    name: "Player Locker",
    description: "Create a player that feels like you. Mix faces, hairstyles, uniforms and accessories, then save your look or share an appearance code.",
    image: "/images/game/locker.webp",
    alt: "Just Volleyball Locker with a custom player and uniform options",
    features: ["Character customization", "Item try-on", "Appearance codes"],
    action: "Open Locker",
  },
];

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Tools", href: "/tools/" }]} />
      <PageIntro
        title="Just Volleyball Tools"
        description="Build your player. Find your look. Take it onto the court."
      />
      <div className={styles.list}>
        {tools.map(tool => (
          <a key={tool.href} href={tool.href} className={styles.card}>
            <div className={styles.image}>
              <Image
                src={tool.image}
                alt={tool.alt}
                width={1920}
                height={1080}
                sizes="(max-width: 700px) 90vw, (max-width: 1200px) 38vw, 470px"
              />
            </div>
            <div className={styles.content}>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <ul>{tool.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              <span className={styles.action}>{tool.action}<span aria-hidden="true">→</span></span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
