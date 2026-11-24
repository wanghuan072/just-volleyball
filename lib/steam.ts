import "server-only";
import { cacheLife } from "next/cache";
import snapshot from "@/data/steam-snapshot.json";
export type PlayerData = {
  count: number | null;
  fetchedAt: string | null;
  sourceUrl: string;
  cached: boolean;
};
export const playersSource = (app: number) =>
  `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${app}`;
export async function getPlayers(app = 5037200): Promise<PlayerData> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  const sourceUrl = playersSource(app);
  if (process.env.NEXT_PHASE === "phase-production-build") return {
    count: app === 5037200 ? snapshot.playerCount : null,
    fetchedAt: app === 5037200 && snapshot.playerCount !== null ? snapshot.fetchedAt : null,
    sourceUrl, cached: true,
  };
  try {
    const response = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("Steam unavailable");
    const data = await response.json();
    const count = data.response?.player_count;
    if (
      data.response?.result !== 1 ||
      !Number.isSafeInteger(count) ||
      count < 0
    )
      throw new Error("Invalid player data");
    return {
      count,
      fetchedAt: new Date().toISOString(),
      sourceUrl,
      cached: false,
    };
  } catch {
    return {
      count: app === 5037200 ? snapshot.playerCount : null,
      fetchedAt:
        app === 5037200 && snapshot.playerCount !== null
          ? snapshot.fetchedAt
          : null,
      sourceUrl,
      cached: true,
    };
  }
}
type Price = {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
};
export async function getPrice(): Promise<{
  price: Price | null;
  fetchedAt: string | null;
  cached: boolean;
}> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  if (process.env.NEXT_PHASE === "phase-production-build") return {
    price: snapshot.price as Price | null, fetchedAt: snapshot.priceFetchedAt, cached: true,
  };
  try {
    const response = await fetch(
      "https://store.steampowered.com/api/appdetails?appids=5037200&cc=us&l=english&filters=price_overview",
      { signal: AbortSignal.timeout(7000) },
    );
    if (!response.ok) throw new Error("Unavailable");
    const data = await response.json();
    const price = data["5037200"]?.data?.price_overview;
    if (
      !data["5037200"]?.success ||
      !price ||
      price.currency !== "USD" ||
      !Number.isFinite(price.final) ||
      price.final < 0
    )
      throw new Error("No price");
    return { price, fetchedAt: new Date().toISOString(), cached: false };
  } catch {
    return {
      price: snapshot.price as Price | null,
      fetchedAt: snapshot.priceFetchedAt,
      cached: true,
    };
  }
}
