import type { Metadata } from "next";
import { tdk } from "@/seo/tdk.js";
export const siteUrl = "https://justvolleyball.app";
export const steamUrl = "https://store.steampowered.com/app/5037200/";
export const demoUrl = "https://store.steampowered.com/app/5401090/";
export const nav = [
  ["Home", "/"],
  ["Skins & Codes", "/skins/"],
  ["Characters", "/characters/"],
  ["Guides", "/guides/"],
  ["Tools", "/tools/"],
  ["Updates", "/updates/"],
] as const;
export function pageMetadata(path: keyof typeof tdk): Metadata {
  return metadata(tdk[path].title, tdk[path].description, path);
}
export function metadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const entry = (tdk as Record<string, { title: string; description: string }>)[path.split("?")[0]];
  if (entry) {
    const page = new URL(path, siteUrl).searchParams.get("page");
    title = entry.title + (page && page !== "1" ? ` - Page ${page}` : "");
    description = entry.description;
  }
  return {
    title,
    description,
    alternates: { canonical: siteUrl + path },
    openGraph: {
      title,
      description,
      url: siteUrl + path,
      siteName: "Just Volleyball",
      type: "website",
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Just Volleyball fan site - skins, codes and player guides" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.png"],
    },
  };
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}
export function timestamp(date: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(date)) + " UTC"
  );
}
