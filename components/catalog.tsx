import { catalog, type Query } from "@/lib/catalog";
import { skins } from "@/lib/content";
import { SkinCard } from "./shared";
import styles from "@/styles/site.module.css";

const tagCounts = new Map<string, number>();
for (const skin of skins) {
  for (const tag of new Set([skin.category, ...skin.tags])) {
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
}
const tags = [...tagCounts.keys()].sort((a, b) => a.localeCompare(b));
const popularTags = [...tagCounts].sort((a, b) => b[1] - a[1]).slice(0, 8);

export async function Catalog({
  searchParams,
  category = "",
}: {
  searchParams: Promise<Query>;
  category?: string;
}) {
  const result = catalog(await searchParams, category);
  const base = category ? `/skins/${category}/` : "/skins/";
  function filterUrl(tag: string, page = 1) {
    const params = new URLSearchParams();
    if (result.search) params.set("q", result.search);
    if (tag && !category) params.set("category", tag);
    if (result.sort !== "curated") params.set("sort", result.sort);
    if (page > 1) params.set("page", String(page));
    return `${base}${params.size ? `?${params}` : ""}`;
  }

  return (
    <>
      <form className={styles.catalogForm} method="get" action={base}>
        <div className={styles.field}>
          <label htmlFor="skin-search">Search names, tags or creators</label>
          <input type="search" id="skin-search" name="q" defaultValue={result.search} placeholder="Try Hinata or anime" maxLength={150} />
        </div>
        {!category && (
          <div className={styles.field}>
            <label htmlFor="category">Tag</label>
            <select id="category" name="category" defaultValue={result.tag}>
              <option value="">All tags</option>
              {tags.map(tag => <option key={tag} value={tag}>{tag} ({tagCounts.get(tag)})</option>)}
            </select>
          </div>
        )}
        <div className={styles.field}>
          <label htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={result.sort}>
            <option value="curated">Featured</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        <button type="submit" className={styles.primaryButton}>Find skins</button>
      </form>
      {!category && (
        <nav className={styles.catalogTags} aria-label="Popular tags">
          <a href={filterUrl("")} aria-current={!result.tag ? "true" : undefined}>All skins</a>
          {popularTags.map(([tag, count]) => (
            <a href={filterUrl(tag)} key={tag} aria-current={result.tag === tag ? "true" : undefined}>#{tag} <span>{count}</span></a>
          ))}
        </nav>
      )}
      <div className={styles.resultsLine}>
        <span>{result.total} {result.total === 1 ? "skin" : "skins"} · Page {result.page} of {result.pages}</span>
        {(result.search || result.tag || result.sort !== "curated") && <a href={base}>Reset filters</a>}
      </div>
      {result.items.length ? (
        <div className={`${styles.catalogGrid} ${styles.catalogListingGrid}`}>
          {result.items.map(skin => <SkinCard key={skin.id} skin={skin} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <h3>No matching skins</h3>
          <p>Try a shorter name or a different tag.</p>
          <a href={base}>Clear filters</a>
        </div>
      )}
      {result.pages > 1 && (
        <nav className={styles.pagination} aria-label="Skin pages">
          {Array.from({ length: result.pages }, (_, index) => index + 1).map(page =>
            page === result.page
              ? <span key={page} aria-current="page">{page}</span>
              : <a key={page} href={filterUrl(result.tag, page)}>{page}</a>,
          )}
        </nav>
      )}
      
    </>
  );
}
