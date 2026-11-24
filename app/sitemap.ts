import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import pages from "@/seo/page-dates.json";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(pages).map(([path, page]) => ({
    url: siteUrl + path,
    lastModified: page.lastModified,
  }));
}
