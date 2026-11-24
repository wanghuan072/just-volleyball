import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { infoPages } from "@/data/info";
import { metadata as makeMetadata, steamUrl, timestamp } from "@/lib/site";
import { getPrice } from "@/lib/steam";
import { gameInfo } from "@/data/game-info";
import { Breadcrumbs, PageIntro, Panel, Faq } from "@/components/shared";
import styles from "@/styles/site.module.css";

const redirects: Record<string, string> = {
  about: "/legal/about-us/", contact: "/legal/contact-us/",
  "privacy-policy": "/legal/privacy-policy/", disclaimer: "/legal/copyright/",
  demo: "/guides/demo/", "release-date": "/guides/release-date/",
};
export function generateStaticParams() { return Object.keys(infoPages).map(slug => ({ slug })); }
export async function generateMetadata({params}: {params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(redirects[slug]) redirect(redirects[slug]);
  const info=infoPages[slug as keyof typeof infoPages];
  return info ? makeMetadata(info.title,info.description,`/${slug}/`) : {};
}
async function Price() {
  const data=await getPrice();
  return <>
    <h2>US Steam price</h2>
    {data.price ? <p className={styles.priceAmount}>{data.price.final_formatted}</p> : <p>Open Steam for the current price in your region.</p>}
    {data.price && data.price.discount_percent > 0 && <p>{data.price.discount_percent}% off at the time checked. Regular price {data.price.initial_formatted}.</p>}
    {data.fetchedAt && <p>{data.cached ? "Last available price" : "Price checked"} {timestamp(data.fetchedAt)} · USD</p>}
    <p>Prices, promotions and taxes can vary by region. Confirm the amount in your Steam checkout before purchasing.</p>
    <a className={styles.primaryButton} href={steamUrl}>Check price on Steam</a>
  </>;
}
export default function Page(props:{params:Promise<{slug:string}>}) {
  return <Suspense fallback={<p role="status">Loading game information…</p>}><InfoContent {...props}/></Suspense>;
}
async function InfoContent({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(redirects[slug]) redirect(redirects[slug]);
  if(!["price","discord","mobile"].includes(slug)) notFound();
  const content = {
    price: {title:"Just Volleyball Price — Check Before You Buy",description:"Check the available US Steam price and its reading date, then open the store to see the offer for your region."},
    discord: {title:"Just Volleyball Discord — Find Your Next Game",description:"Join the developer’s community to meet players, arrange a lobby and follow game announcements."},
    mobile: {title:"Just Volleyball Platforms — Where Can You Play?",description:"Check the Windows release and understand how streaming differs from installing a game on your phone or console."},
  }[slug]!;
  return <>
    <Breadcrumbs items={[{name:slug==="price"?"Price":slug==="discord"?"Discord":"Platforms",href:`/${slug}/`}]}/>
    <PageIntro title={content.title} description={content.description}/>
    <Panel className={styles.article}>
      {slug==="price" ? <Price/> : slug==="discord" ? <>
        <h2>Join the community</h2><p>Use the developer’s Discord invite to find other players and follow discussion about the game. Check each channel’s rules before posting.</p>
        <a className={styles.primaryButton} href={gameInfo.discordUrl} rel="noopener noreferrer" target="_blank">Open Discord</a>
        <h2>Arranging a match</h2><p>Tell players your region, preferred team size and whether you are practicing or playing competitively. Agree on the host and start time, then use your in-game party or lobby invitation.</p>
        <h2>Getting help</h2><p>For a game problem, describe the version, what you attempted and what happened. Keep account passwords and authentication codes private. For a problem with this website, email support@justvolleyball.app.</p>
        <p><a href="/guides/online/">Read the online and friends guide →</a></p>
      </> : <>
        <h2>Windows PC through Steam</h2><p>The confirmed release platform is Windows PC. Open the Steam listing to check current system requirements before installing. A mobile app or native console edition is not established by this site.</p>
        <h2>Playing through a host PC</h2><p>Steam streaming can let a compatible device display a game running on a host computer. The host still runs the Windows game; the receiving device sends inputs and receives the video stream. Test your connection and controls before arranging a session.</p>
        <h2>Playing with friends</h2><p>For separate online clients, use compatible game versions and a supported installation. Remote Play Together can instead stream a supported local session from the owner’s PC. Check the intended input assignment for every player.</p>
        <p><a href="/guides/online/">Compare online, LAN and shared play →</a></p>
      </>}
      <Faq items={slug==="price" ? [["Is the price the same everywhere?","Steam prices and promotions can vary by region. Confirm the final amount at checkout."],["Where can I see release information?","The Updates page includes Release & Price and patch history."]] : [["Can this website change my game account?","No. Contact the game or platform support route for purchases, licenses and account problems."]]}/>
    </Panel>
  </>;
}
