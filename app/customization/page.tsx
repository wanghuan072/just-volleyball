import Image from "next/image";
import assets from "@/data/extracted-assets.json";
import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = pageMetadata("/customization/");
export default function Page() {
  return <>
    <Breadcrumbs items={[{name:"Customization",href:"/customization/"}]} />
    <PageIntro title="Just Volleyball Customization" eyebrow="Inside the Locker" description="Choose the face, hair and clothing details for your player, explore accessories, and continue building the look in the Locker." />
    <nav className={styles.partsNav} aria-label="Customization categories">
      {assets.groups.filter(g=>g.id!=="stickers").map(g=><a key={g.id} href={`#${g.id}`}>{g.label} · {g.count}</a>)}
      <a href="#hair">Hairstyles · {assets.hair.count}</a><a href="#accessories">Accessories · {assets.accessories.count}</a><a href="#studio-stickers">Studio stickers · 4</a>
    </nav>
    <Panel><h2>A look is more than a code</h2><p>Customize the body, layered facial features, hair, uniform, shorts, socks, kneepads and accessories. Combine the parts in the Locker and check how they look together before saving your player.</p><p>Use the Locker&apos;s 50 personal preset slots to save combinations. <a href="/skins/">Browse community looks</a> or <a href="/character-codes/how-to-create/">learn how to share your own</a>.</p></Panel>
    {assets.groups.filter(g=>g.id!=="stickers").map(group=><section id={group.id} key={group.id} className={styles.partsSection}>
      <Panel><h2>{group.label} <span className={styles.countLabel}>{group.count} options</span></h2>
        <p>{group.countConvention} These counts do not guarantee that every item is already unlocked on your account.</p>
        <div className={styles.partsGrid}>{group.items.filter(item=>item.image).map(item=><figure key={item.id} className={styles.partTile}>
          <Image src={item.image!} width={item.width!} height={item.height!} sizes="(max-width:768px) 28vw, 150px" alt={`${item.name} original game ${group.label.toLowerCase()} component`} />
          <figcaption>{item.name}<code>{item.id}</code></figcaption>
        </figure>)}</div>
        <details><summary>All {group.count} option names</summary><div className={styles.resourceIds}>{group.items.map(item=><code key={item.id}>{item.id}</code>)}</div></details>
        
      </Panel>
    </section>)}
    <section id="hair" className={styles.partsSection}><Panel><h2>Hairstyles</h2><p>Explore {assets.hair.count} hairstyle options. Compare them with your face shape and accessories, then open the Locker to see how the combination looks on your player.</p><details><summary>Browse hairstyle names</summary><div className={styles.resourceIds}>{assets.hair.items.map(item=><code key={item.id}>{item.id}</code>)}</div></details></Panel></section>
    <section id="accessories" className={styles.partsSection}><Panel><h2>Accessories & ownership</h2><p>Browse headwear, face accessories and extras for your outfit. Paid accessories in game version 1.0.3 cost 1,000 chips each. Supporter items have separate ownership requirements.</p><p>Imported codes do not grant ownership. The game checks missing items and can remove unowned accessories when wearing the look. Multiple slots can reuse one owned item.</p>
      <div className={styles.tableScroll}><table><caption>Game 1.0.3 accessory catalog</caption><thead><tr><th scope="col">Item</th><th scope="col">Item code</th><th scope="col">Slot category</th><th scope="col">Requirement</th></tr></thead><tbody>{assets.accessories.items.map(item=><tr key={item.id}><td>{item.displayName}</td><td><code>{item.id}</code></td><td>{item.category}</td><td>{item.supporter?"Supporter entitlement":`${item.price.toLocaleString("en-US")} chips`}</td></tr>)}</tbody></table></div>
      
    </Panel></section>
    <section id="studio-stickers" className={styles.partsSection}><Panel><h2>Studio stickers</h2><p>The examined Studio menu explicitly lists the game logo and three ball images. Its separate scrap list is empty; 26 other sticker-directory images are not presented here as available menu choices.</p><div className={styles.partsGrid}>{assets.studioStickers.items.map(item=><figure key={item.id} className={`${styles.partTile} ${styles.darkPart}`}><Image src={item.image} width={item.width} height={item.height} sizes="150px" alt={`${item.name} game Studio sticker`} /><figcaption>{item.name}</figcaption></figure>)}</div></Panel></section>
  </>;
}
