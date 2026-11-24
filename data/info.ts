export const infoPages = {
  demo: {
    title: "Just Volleyball Demo",
    description:
      "Demo history, the current availability check and the official Steam App ID.",
  },
  "release-date": {
    title: "Just Volleyball Release Date",
    description:
      "The full game released on November 16, 2026. Find the official Steam source and distinguish it from older launch plans.",
  },
  price: {
    title: "Just Volleyball Price",
    description:
      "US-region Steam pricing, with currency, retrieval time and a direct official purchase link.",
  },
  discord: {
    title: "Just Volleyball Discord & Community",
    description:
      "Find the developer’s community through verified official channels and avoid unrelated invite links.",
  },
  mobile: {
    title: "Is Just Volleyball on Mobile?",
    description:
      "Confirmed Steam platform information and what is not established about Android, iOS or console versions.",
  },
  about: {
    title: "About Just Volleyball",
    description:
      "An independent English-language player resource for skins, codes, sourced guides and useful tools.",
  },
  contact: {
    title: "Contact Just Volleyball",
    description:
      "Contact support@justvolleyball.app about corrections, resource credits and this independent fan site.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "How this Just Volleyball fan site handles browsing, code checks, external links and email contact.",
  },
  disclaimer: {
    title: "Disclaimer & Credits",
    description:
      "Fan-site independence, game and character ownership, source attribution and the limits of compatibility checks.",
  },
} as const;
export type InfoSlug = keyof typeof infoPages;
