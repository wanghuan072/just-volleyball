import Image from "next/image";
import art from "@/data/game-character-art.json";
import styles from "@/styles/site.module.css";
export function GameArtCard({item,compact=false}:{item:(typeof art.items)[number];compact?:boolean}){
  return <article className={`${styles.skinCard} ${compact?styles.compactSkin:""}`}>
    <a className={styles.skinImage} href={`/characters/spectators/#${item.id}`}><Image src={item.image} alt={`${item.label}: original spectator character PNG from the game package`} width={item.width} height={item.height} sizes={compact?"90px":"160px"}/></a>
    <div className={styles.skinCardBody}>
      <a className={styles.cardTitle} href={`/characters/spectators/#${item.id}`}>{item.label}</a>
      <div className={styles.tags}><span>Game PNG</span><span>Spectator</span></div>
      <a className={styles.copyButton} href={`/characters/spectators/#${item.id}`}>View asset</a>
    </div>
  </article>;
}
