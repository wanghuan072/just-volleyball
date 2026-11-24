import type { NextConfig } from "next";
import updates from "./data/updates.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/character-codes/", destination: "/skins/#character-codes", permanent: true },
      ...[
        ["/tools/code-checker/", "/tools/"],
        ["/tools/player-count/", "/tools/"],
        ["/about/", "/legal/about-us/"],
        ["/contact/", "/legal/contact-us/"],
        ["/privacy-policy/", "/legal/privacy-policy/"],
        ["/disclaimer/", "/legal/copyright/"],
        ["/demo/", "/guides/demo/"],
        ["/release-date/", "/guides/release-date/"],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
      ...updates.map(update => ({ source: `/updates/${update.slug}/`, destination: `/updates/#${update.slug}`, permanent: true })),
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
