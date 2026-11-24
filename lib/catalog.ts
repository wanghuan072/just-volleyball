import { skins, type Skin } from "./content";
export type Query = Record<string, string | string[] | undefined>;
export function queryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}
export function catalog(query: Query, category = "", records: Skin[] = skins, pageSize = 20) {
  const search = queryValue(query.q).trim().slice(0, 150);
  const tag = category || queryValue(query.category);
  const sort = queryValue(query.sort) === "name" ? "name" : "curated";
  const filtered = records.filter(
    (s) =>
      (!tag || s.category === tag || s.tags.includes(tag)) &&
      (!search ||
        [s.name, s.creator, s.sourceAccount, ...s.tags]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(
    pages,
    Math.max(1, parseInt(queryValue(query.page)) || 1),
  );
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    pages,
    page,
    search,
    tag,
    sort,
  };
}
