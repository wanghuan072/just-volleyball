import "server-only";
import { cacheLife } from "next/cache";
import { updates } from "./content";
type NewsItem = {
  gid: string;
  title: string;
  url: string;
  date: number;
  feedname: string;
  author: string;
};
function savedNews() {
  return {
    items: updates.map(u => ({ id: u.slug, title: u.title, publishedAt: u.publishedAt, url: `/updates/#${u.slug}` })),
    fetchedAt: updates[0].updatedAt,
    cached: true,
  };
}
export async function getNews() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  // Production builds must not depend on Steam availability. Runtime cache
  // revalidation still fetches live announcements after deployment.
  if (process.env.NEXT_PHASE === "phase-production-build") return savedNews();
  try {
    const r = await fetch(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=5037200&count=6&maxlength=0",
      { signal: AbortSignal.timeout(7000) },
    );
    if (!r.ok) throw new Error("Steam unavailable");
    const data = await r.json();
    if (!Array.isArray(data.appnews?.newsitems))
      throw new Error("Invalid response");
    const items: NewsItem[] = data.appnews.newsitems;
    return {
      items: items
        .filter(
          (i) =>
            i.feedname === "steam_community_announcements" &&
            typeof i.title === "string" &&
            Number.isFinite(i.date),
        )
        .map((i) => ({
          id: i.gid,
          title: i.title,
          publishedAt: new Date(i.date * 1000).toISOString(),
          url: `https://store.steampowered.com/news/app/5037200/view/${encodeURIComponent(i.gid)}`,
        })),
      fetchedAt: new Date().toISOString(),
      cached: false,
    };
  } catch {
    return savedNews();
  }
}
