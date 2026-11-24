import { metadata } from "./site";
import { catalog, type Query } from "./catalog";
export async function listMetadata(
  title: string,
  description: string,
  path: string,
  searchParams: Promise<Query>,
  category = "",
) {
  const query = await searchParams;
  const result = catalog(query, category);
  const temporary = !!(query.q || query.category || query.sort);
  const paginated = !temporary && result.page > 1;
  const canonical = path + (paginated ? `?page=${result.page}` : "");
  return {
    ...metadata(
      title + (paginated ? ` — Page ${result.page}` : ""),
      description,
      canonical,
    ),
    robots:
      temporary || (!!category && result.total === 0)
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}
