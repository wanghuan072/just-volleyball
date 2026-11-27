import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { AppHeader, AppFooter } from "@/components/chrome";
import { JsonLd } from "@/components/shared";
import { siteUrl } from "@/lib/site";
import styles from "@/styles/site.module.css";
import "./globals.css";
const bodyFont = localFont({
  src: "../public/fonts/roboto-condensed.ttf",
  variable: "--font-body-family",
  weight: "100 900",
  display: "swap",
});
const displayFont = localFont({
  src: "../public/fonts/lilita-one.ttf",
  variable: "--font-display-family",
  weight: "400",
  display: "swap",
});
export const metadata: Metadata = {
  verification: { other: { "msvalidate.01": "D8EF052A74B4BB3D3229205232205792" } },
  metadataBase: new URL(siteUrl),
  applicationName: "Just Volleyball Fan Site",
  openGraph: { type: "website", siteName: "Just Volleyball", images: [{ url: "/images/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/images/og-image.png"] },
  title: "Just Volleyball",
  description:
    "Skins, character codes, guides and useful tools for Just Volleyball players.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "192x192" }],
    apple: "/apple-icon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KHNB43V9');`}
        </Script>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className={styles.siteBackground} aria-hidden="true" />
        <div className="container">
          <AppHeader />
        </div>
        <main id="main" className={`container ${styles.main}`}>
          {children}
        </main>
        <AppFooter />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Just Volleyball",
            url: siteUrl,
            inLanguage: "en",
            description: "An independent Just Volleyball player resource.",
          }}
        />
      </body>
    </html>
  );
}
