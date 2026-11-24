import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, PageIntro, Panel } from "@/components/shared";
import { getPlayers } from "@/lib/steam";
import { metadata as makeMetadata, timestamp } from "@/lib/site";
import styles from "@/styles/site.module.css";
export const metadata = makeMetadata(
  "Just Volleyball Player Count — Steam Players & Data Sources",
  "See current-player responses from the official Steam API for Just Volleyball and its demo, with timestamps, availability and historical-data limits.",
  "/tools/player-count/",
);
async function Stats() {
  const results = await Promise.all([getPlayers(), getPlayers(5401090)]);
  return (
    <div className={styles.statsGrid}>
      {results.map((data, i) => (
        <section className={styles.statBox} key={i}>
          <h2>{i ? "Demo · App 5401090" : "Full game · App 5037200"}</h2>
          <p className={styles.statValue}>
            {data.count === null
              ? "Unavailable"
              : data.count.toLocaleString("en-US")}
          </p>
          <p>
            {data.count === null
              ? "No usable response from Steam."
              : "Concurrent Steam players reported by the API."}
          </p>
          {data.fetchedAt && (
            <small>
              {data.cached ? "Saved snapshot" : "Retrieved"}:{" "}
              <time dateTime={data.fetchedAt}>{timestamp(data.fetchedAt)}</time>
            </small>
          )}
          
        </section>
      ))}
    </div>
  );
}
export default function Page() {
  redirect("/tools/");
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Tools", href: "/tools/" },
          { name: "Player Count", href: "/tools/player-count/" },
        ]}
      />
      <PageIntro
        title="Just Volleyball Player Count"
        description="Steam concurrent-player data with an honest timestamp. The full game and the old Demo have different App IDs."
      />
      <Panel>
        <Suspense
          fallback={
            <p className={styles.notice}>Requesting Steam player data…</p>
          }
        >
          <Stats />
        </Suspense>
        <div className={styles.article} id="sources">
          <h2>What these numbers mean</h2>
          <p>
            The Steam endpoint reports current concurrent users for one App ID.
            It is not total sales, unique daily players, all platforms or a
            measure of the number of joinable lobbies. A zero response and a
            failed request are shown differently.
          </p>
          <h2>Peaks and historical charts</h2>
          <p>
            The current-player endpoint does not supply a 24-hour peak, an
            all-time peak or a history series. Those figures are omitted here
            until a reliable dataset is available. Do not compare this single
            response to a graph without checking its time range and App ID.
          </p>
          <p>
            For independently maintained historical statistics, visit{" "}
            <a
              href="https://steamdb.info/app/5037200/charts/"
              target="_blank"
              rel="noopener noreferrer"
            >
              SteamDB charts
            </a>{" "}
            or{" "}
            <a
              href="https://steamcharts.com/app/5037200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Steam Charts
            </a>
            . These are external sources; their data is not republished here.
          </p>
          <h2>When Steam does not respond</h2>
          <p>
            Requests time out after seven seconds. A sourced saved snapshot may
            be shown with its original timestamp; otherwise the result is marked
            unavailable. Refreshing this page within the cache window will not
            force a new upstream request.
          </p>
        </div>
      </Panel>
    </>
  );
}
