import Image from "next/image";
import art from "@/data/game-character-art.json";
import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";

const title = "Just Volleyball Spectator Artwork";
const description = `Meet the ${art.count} illustrated spectators around the Just Volleyball court. For your own player, open the Locker and choose a custom look.`;

export const metadata = pageMetadata("/characters/spectators/");

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[
        { name: "Characters", href: "/characters/" },
        { name: "Spectator Artwork", href: "/characters/spectators/" },
      ]} />
      <PageIntro title={title} description={description} />
      <Panel>
        <div className={styles.characterArtGrid}>
          {art.items.map(item => (
            <figure id={item.id} key={item.id} className={styles.characterArtTile}>
              <Image src={item.image} width={item.width} height={item.height} sizes="(max-width:768px) 42vw, 180px" alt={`${item.label} in-game crowd artwork`} />
              <figcaption>
                <strong>{item.label}</strong>
                <a href={item.image}>Open original PNG</a>
              </figcaption>
            </figure>
          ))}
        </div>

      </Panel>
    </>
  );
}
