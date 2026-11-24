import Image from "next/image";
import { cacheLife } from "next/cache";
import { nav, steamUrl } from "@/lib/site";
import { Icon } from "./icon";
import { gameInfo } from "@/data/game-info";
import styles from "@/styles/site.module.css";
export function AppHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="/" aria-label="Just Volleyball home">
        <Image src="/images/logo.png" alt="" width={44} height={44} />
        <span>Just Volleyball</span>
      </a>
      <nav className={styles.desktopNav} aria-label="Main navigation">
        {nav.map(([name, url]) => (
          <a key={url} href={url}>
            {name}
          </a>
        ))}
      </nav>
      <a
        className={styles.steamButton}
        href={steamUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="steam" />
        <span>Play on Steam</span>
      </a>
      <details className={styles.mobileMenu}>
        <summary aria-label="Open navigation">
          <Icon name="menu" />
        </summary>
        <nav aria-label="Mobile navigation">
          {nav.map(([name, url]) => (
            <a key={url} href={url}>
              {name}
            </a>
          ))}
        </nav>
      </details>
    </header>
  );
}
export async function AppFooter() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <a className={styles.brand} href="/">
            <Image src="/images/logo.png" alt="" width={44} height={44} />
            <span>Just Volleyball</span>
          </a>
          <nav aria-label="Footer navigation">
            {nav.map(([name, url]) => (
              <a key={url} href={url}>
                {name}
              </a>
            ))}
          </nav>
          <a href={steamUrl} aria-label="Just Volleyball on Steam">
            <Icon name="steam" />
          </a>
          <a href={gameInfo.discordUrl} aria-label="Official temkosoft Discord">
            <Icon name="users" />
          </a>
        </div>
        <div className={styles.footerBottom}>
          <h3>Legal</h3>
          <nav aria-label="Legal">
            {[
              ["Privacy Policy", "privacy-policy"],
              ["Terms of Service", "terms-of-service"],
              ["Copyright", "copyright"],
              ["About Us", "about-us"],
              ["Contact Us", "contact-us"],
            ].map(([name, path]) => <a key={path} href={`/legal/${path}/`} rel="noopener noreferrer nofollow">{name}</a>)}
          </nav>
          <p>Copyright © {new Date().getUTCFullYear()} justvolleyball.app. All rights reserved.</p>
          <p>Independent fan site. Not affiliated with or endorsed by temkosoft or Valve.</p>
        </div>
      </div>
    </footer>
  );
}
