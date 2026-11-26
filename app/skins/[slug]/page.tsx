import pageDates from "@/seo/page-dates.json";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { skins, findSkin } from "@/lib/content";
import { metadata as makeMetadata, siteUrl } from "@/lib/site";
import {
  Breadcrumbs,
  PageIntro,
  Panel,
  ImportSteps,
  SkinCard,
  Faq,
  JsonLd,
} from "@/components/shared";
import { PortraitImage } from "@/components/portrait-image";
import { CopyButton } from "@/components/interactive";
import { Catalog } from "@/components/catalog";
import type { Query } from "@/lib/catalog";
import { listMetadata } from "@/lib/list-metadata";
import { shopHref } from "@/lib/shop-look";
import styles from "@/styles/site.module.css";
export function generateStaticParams() { return [...skins.map(s => ({slug:s.slug})), {slug:"anime"}, {slug:"haikyuu"}]; }
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  if (!skins.length) return { robots: { index: false, follow: true } };
  if (["haikyuu", "anime"].includes(slug))
    return listMetadata(
      `Just Volleyball ${slug === "haikyuu" ? "Haikyuu" : "Anime"} Skins`,
      `Browse ${slug} community outfits, compare their accessories and copy a character code for your Locker.`,
      `/skins/${slug}/`,
      searchParams,
      slug,
    );
  const skin = findSkin(slug);
  return skin
    ? makeMetadata(
        skin.seo.title,
        skin.seo.description,
        `/skins/${slug}/`,
      )
    : {};
}
export default function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
}) {
  return (
    <Suspense fallback={<p role="status">Loading character preset…</p>}>
      <SkinContent {...props} />
    </Suspense>
  );
}
async function SkinContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  if (!skins.length) notFound();
  if (["haikyuu", "anime"].includes(slug)) {
    const name = slug === "haikyuu" ? "Haikyuu" : "Anime";
    return (
      <>
        <Breadcrumbs
          items={[
            { name: "Skins", href: "/skins/" },
            { name, href: `/skins/${slug}/` },
          ]}
        />
        <PageIntro
          title={`Just Volleyball ${name} Skins`}
          description={slug === "haikyuu"
            ? "Hinata, Kageyama and Atsumu need no Shop accessories. Nishinoya’s sprout is 1,000 chips. Copy a code, then import it from Locker, Presets."
            : "Anime looks include Asta at 7,000 chips and Minato, Johnny Joestar and Mahoraga at 6,000 chips. Each card lists the accessories and the character code."}
        />
        <Panel>
          <Suspense fallback={<p>Loading presets…</p>}>
            <Catalog searchParams={searchParams} category={slug} />
          </Suspense>
        </Panel>
      </>
    );
  }
  const skin = findSkin(slug);
  if (!skin) notFound();
  const hair = skin.evidence.decoded.hairId || "Bald";
  const color = skin.evidence.decoded.hairColor;
  const number = skin.evidence.decoded.jerseyNumber;
  const cost = skin.evidence.accessoryCost;
  const items = skin.evidence.requiredAccessories.map((item) => `${item.displayName} (${item.price.toLocaleString("en-US")} chips)`);
  const comparison = cost === 0
    ? `${skin.name} needs no Shop accessories in Just Volleyball, so the total is 0 chips. Hinata and Kageyama are the same. Gear 5 Luffy lists adventure backpack, halo, headband, sleek visor and wings at 5,000 chips. Itadori Yuji lists a nose bandage, round glasses and a scarf at 3,000 chips. Tell this look apart by the ${hair} hair style, colour #${color}, and jersey ${number}.`
    : `${skin.name} in Just Volleyball needs ${items.join(", ")}. The total is ${cost.toLocaleString("en-US")} chips if you own none. Hinata and Kageyama need 0 chips. Gear 5 Luffy needs 5,000 chips for adventure backpack, halo, headband, sleek visor and wings. Itadori Yuji needs 3,000 chips for a nose bandage, round glasses and a scarf. This card uses the ${hair} hair style, colour #${color}, and jersey ${number}.`;
  const faq: [string, string][] = [
    [`How many chips does ${skin.name} need in Just Volleyball?`, comparison],
    [`Is ${skin.name} an official Just Volleyball character?`, `No. ${skin.name} is a community appearance credited to ${skin.sourceAccount}. It is not an official roster character. The saved head is the ${hair} hair style in #${color}, jersey ${number}.`],
    [`What if the ${skin.name} code does not import?`, `Copy the full ${skin.name} code, open Just Volleyball, and use Locker, Presets, then Import. Update the game if it is rejected. Unlock the accessories named above before you confirm. Hair ${hair} and jersey ${number} should match this page after import.`],
  ];
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Skins", href: "/skins/" },
          { name: skin.name, href: `/skins/${slug}/` },
        ]}
      />
      <Panel className={styles.skinDetail}>
        <div className={styles.skinDetailVisual}>
          <div className={styles.skinDetailImage}>
            <PortraitImage skin={skin} fitStage />
          </div>
          <dl className={styles.skinFacts}>
            <div><dt>Hair style</dt><dd>{skin.evidence.decoded.hairId || "Bald"}</dd></div>
            <div><dt>Jersey number</dt><dd>{skin.evidence.decoded.jerseyNumber}</dd></div>
            <div><dt>Hair colour</dt><dd>#{skin.evidence.decoded.hairColor}</dd></div>
          </dl>
        </div>
        <div className={styles.skinDetailInfo}>
          <header>
            <p className={styles.skinCredit}>Community look · {skin.sourceAccount}</p>
            <h1>{skin.name}</h1>
            <div className={styles.tags}>
              {skin.tags.map(tag => (
                <a key={tag} href={tag === "anime" || tag === "haikyuu" ? `/skins/${tag}/` : `/skins/?${new URLSearchParams({ category: tag })}`}>#{tag}</a>
              ))}
            </div>
          </header>
          <div className={styles.codeBox}>
            <h2>Just Volleyball Character Code</h2>
            <code>{skin.code}</code>
            <div className={styles.skinDetailActions}>
              <CopyButton code={skin.code} />
              <a className={styles.secondaryButton} href={`/tools/locker/?code=${encodeURIComponent(skin.code)}`}>Customize in Locker</a>
            </div>
          </div>
          <section className={styles.skinRequirements}>
            <h2>Required accessories</h2>
            {skin.evidence.requiredAccessories.length > 0 ? (
              <>
                <ul>
                  {skin.evidence.requiredAccessories.map(item => (
                    <li key={item.id}>
                      <a href={shopHref(skin.slug, item.id)}>{item.displayName}</a>
                      <strong>{item.price.toLocaleString("en-US")} chips</strong>
                    </li>
                  ))}
                </ul>
                <p><strong>{skin.evidence.accessoryCost.toLocaleString("en-US")} chips</strong> total if you own none of these items.</p>
                <a className={styles.secondaryButton} href={shopHref(skin.slug)}>View required items in Shop</a>
              </>
            ) : (
              <p>No accessories required.</p>
            )}
          </section>
        </div>
      </Panel>
      <div className={styles.skinDetailSupport}>
        <Panel>
          <h2>How to import</h2>
          <ImportSteps />
          <a className={styles.smallLink} href="/character-codes/how-to-import/">Full import guide</a>
        </Panel>
        <Panel>
          <h2>About this {skin.name} look</h2>
          <p>{skin.name} is a community outfit for Just Volleyball, shared by {skin.sourceAccount}. The appearance code on this page saves the {hair} hair style, hair colour #{color}, and jersey number {number}. Another code that uses the same character idea can still differ in hair, number, colours or accessories, so match this picture before you import it.</p>
          <p>{comparison}</p>
          <p>The required accessories for this {skin.name} code are listed above, each with its chip price. The total under that list is what the Shop charges if you own none of those items. Pasting the code does not unlock them.</p>
          <p><a href={skin.sourceUrl}>View the creator’s post ↗</a></p>
        </Panel>
      </div>
      <Panel>
        <Faq items={faq} />
        <p className={styles.sourceNote}>{skin.rightsNote} Source listing checked November 24, 2026.</p>
      </Panel>
      <section className={styles.related}>
        <h2>More looks for your Locker</h2>
        <div className={styles.catalogGrid}>
          {skins
            .filter((s) => s.slug !== slug)
            .slice(0, 4)
            .map((s) => (
              <SkinCard key={s.id} skin={s} />
            ))}
        </div>
      </section>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CreativeWork",
        name: skin.name, description: skin.seo.description,
        url: `${siteUrl}/skins/${skin.slug}/`, image: siteUrl + skin.image,
        dateModified: pageDates[`/skins/${skin.slug}/` as keyof typeof pageDates]?.lastModified,
        creator: { "@type": "Person", name: skin.sourceAccount },
        isBasedOn: skin.sourceUrl,
      }}/>
    </>
  );
}
