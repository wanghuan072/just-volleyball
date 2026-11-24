import { Icon } from "./icon";
import type { Guide } from "@/data/guides";
import { dateLabel } from "@/lib/site";
import type { updates } from "@/lib/content";
import styles from "@/styles/site.module.css";
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <a className={styles.guideCard} href={`/guides/${guide.slug}/`}>
      <Icon name={guide.icon} />
      <div>
        <h3>{guide.shortTitle}</h3>
        <p>{guide.description}</p>
      </div>
    </a>
  );
}
export function UpdateCard({
  update,
  compact = false,
}: {
  update: (typeof updates)[number];
  compact?: boolean;
}) {
  return (
    <a className={styles.updateCard} href={`/updates/#${update.slug}`}>
      <Icon name={update.version ? "news" : "calendar"} />
      <div>
        <div className={styles.updateMeta}>
          <span>{update.version ? "PATCH" : "NEWS"}</span>
          <time dateTime={update.publishedAt}>
            {dateLabel(update.publishedAt)}
          </time>
        </div>
        <h3>
          {compact
            ? update.version
              ? `Patch ${update.version}`
              : update.slug === "future-updates-ranked-music"
                ? "Ranked & Future Updates"
                : "New Player Tips & Tricks"
            : update.title}
        </h3>
        <p>{update.summary}</p>
      </div>
    </a>
  );
}
