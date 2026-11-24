import type { ReactNode } from "react";
import { PortraitImage } from "./portrait-image";
import { Icon, type IconName } from "./icon";
import { CopyButton } from "./interactive";
import { siteUrl } from "@/lib/site";
import type { Skin } from "@/lib/content";
import styles from "@/styles/site.module.css";
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {all.map((item, i) => (
          <span key={item.href}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {i === all.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <a href={item.href}>{item.name}</a>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: siteUrl + item.href,
          })),
        }}
      />
    </>
  );
}
export function SectionHeading({
  icon,
  title,
  href,
  label,
}: {
  icon: IconName;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2>
        <Icon name={icon} />
        {title}
      </h2>
      {href && (
        <a className={styles.smallLink} href={href}>
          {label ?? "View all"} <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
export function PageIntro({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <div className={styles.pageIntro}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>{children}</section>
  );
}
export function SkinCard({
  skin,
  compact = false,
}: {
  skin: Skin;
  compact?: boolean;
}) {
  return (
    <article
      className={`${styles.skinCard} ${compact ? styles.compactSkin : ""}`}
    >
      <a className={styles.skinImage} href={`/skins/${skin.slug}/`}>
        <PortraitImage skin={skin} />
      </a>
      <div className={styles.skinCardBody}>
        {compact ? (
          <a className={styles.cardTitle} href={`/skins/${skin.slug}/`}>{skin.name}</a>
        ) : (
          <h3 className={styles.catalogCardTitle}>
            <a className={styles.cardTitle} href={`/skins/${skin.slug}/`}>{skin.name}</a>
          </h3>
        )}
        <div className={styles.tags}>
          {skin.tags.slice(0, 2).map((t) => (
            compact ? <span key={t}>{t}</span> : (
              <a key={t} href={`/skins/?${new URLSearchParams({ category: t })}`}>#{t}</a>
            )
          ))}
        </div>
        {!compact && (
          <small>{skin.creator ? `Posted by ${skin.creator}` : "Community submission"}</small>
        )}
        <CopyButton code={skin.code} />
      </div>
    </article>
  );
}
export function ImportSteps() {
  return (
    <ol className={styles.importSteps}>
      <li>Copy a character code.</li>
      <li>
        Open the in-game <strong>Locker</strong>.
      </li>
      <li>
        Go to <strong>Presets</strong> and select <strong>Import</strong>.
      </li>
      <li>Paste, review missing items, then confirm.</li>
    </ol>
  );
}
export function Faq({ items }: { items: [string, string][] }) {
  return (
    <section className={styles.faq}>
      <h2>Frequently asked questions</h2>
      {items.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}
export function SourceNote({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <p className={styles.sourceNote}>
      {children}{" "}
      <a href={href} target="_blank" rel="noopener noreferrer">
        View source ↗
      </a>
    </p>
  );
}
