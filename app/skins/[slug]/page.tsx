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
          description={`Find a ${name}-inspired outfit, preview its appearance and check required accessories before copying the code.`}
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
                <a key={tag} href={`/skins/?${new URLSearchParams({ category: tag })}`}>#{tag}</a>
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
          <h2>Make this look your own</h2>
          <p>{skin.description}</p>
          <p>Open the look in the Locker to adjust its hair, colors and uniform. Check the required items before importing it into your game profile.</p>
          <p><a href={skin.sourceUrl}>View the creator’s post ↗</a></p>
        </Panel>
      </div>
      <Panel>
        <Faq items={[
          [`Is ${skin.name} an official character?`, "This is a community-created appearance for Just Volleyball."],
          ["What if the code does not import?", "Copy the complete code and try importing it in the Locker. Check your game version and any missing accessories before applying the look."],
        ]} />
        <p className={styles.sourceNote}>{skin.rightsNote}</p>
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
