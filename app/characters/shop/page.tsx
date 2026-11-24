import { Breadcrumbs, Panel, SectionHeading } from "@/components/shared";
import { ShopCatalog, type ShopItem, type ShopLook } from "@/components/shop-catalog";
import locker from "@/data/locker-catalog.json";
import shop from "@/data/shop-catalog.json";
import { skins } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
import styles from "@/styles/site.module.css";


export const metadata = pageMetadata("/characters/shop/");

const accessories: ShopItem[] = (["head", "face", "extra"] as const).flatMap(category =>
  locker.accessories
    .filter(item => item.category === category && item.availableInBuild && item.price > 0)
    .map(({ id, label, price }) => ({ id, name: label, price, category })),
);
const titles: ShopItem[] = shop.titles.map(({ id, name, price, requirement }) => (
  { id, name, price, requirement, category: "title" }
));
const effects: ShopItem[] = shop.effects.map(effect => ({ ...effect, category: "effect" }));
const items = [...accessories, ...titles, ...effects];
const looks: ShopLook[] = skins.map(skin => ({
  slug: skin.slug, name: skin.name, code: skin.code, image: skin.image,
  width: skin.render.width, height: skin.render.height, bounds: skin.render.alphaBounds,
  accessories: skin.evidence.requiredAccessories.map(item => item.id),
}));

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[
        { name: "Characters", href: "/characters/" },
        { name: "Shop", href: "/characters/shop/" },
      ]} />
      <ShopCatalog items={items} looks={looks} baseConfig={locker.defaults} />

      <section className={styles.characterSection}>
        <Panel className={styles.characterFeature}>
          <SectionHeading icon="tag" title="Where to Buy, Unlock, and Equip Items" />
          <dl className={`${styles.characterFacts} ${styles.characterFactsRow}`}>
            <div>
              <dt>Head, Face, and Extras</dt>
              <dd>Open <strong>Shop</strong> from the main menu and choose one of these three tabs. In this build each item on those shelves costs 1,000 chips. Equip owned items in <strong>Locker → Accessories</strong>. See the <a href="/customization/#accessories">accessory ownership guide</a> for supporter items.</dd>
            </div>
            <div>
              <dt>Titles and Effects</dt>
              <dd>Open <strong>Shop → Titles</strong> and switch between the <strong>Titles</strong> and <strong>Effects</strong> shelves. Buy a title with chips or complete its listed achievement. Use <strong>Profile → Edit Title</strong> to equip it and style it with an owned effect.</dd>
            </div>
          </dl>
          <details className={styles.shopFreeEffects}>
            <summary>{shop.freeEffects.length} free flag effects in the title editor</summary>
            <p>These effects are available in <strong>Profile → Edit Title</strong> at 0 chips. The Shop Effects shelf lists effects with a price.</p>
            <ul>{shop.freeEffects.map(effect => <li key={effect.id}>{effect.name}</li>)}</ul>
          </details>
          <p>See <a href="/characters/#progression">how to earn chips</a> through matches, level-ups, and awards.</p>
        </Panel>
      </section>
    </>
  );
}
