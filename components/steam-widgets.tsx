import { getPlayers, getPrice } from "@/lib/steam";
import { timestamp } from "@/lib/site";
import { Icon } from "./icon";
import styles from "@/styles/site.module.css";
export async function PlayerCountCard() {
  const data = await getPlayers();
  return (
    <a className={styles.toolCard} href="/tools/player-count/">
      <Icon name="users" />
      <div>
        <h3>Player Count</h3>
        <strong>
          {data.count === null
            ? "Unavailable"
            : data.count.toLocaleString("en-US")}
        </strong>
        <small>
          {data.fetchedAt
            ? `${data.cached ? "Saved snapshot" : "Steam API"} · ${timestamp(data.fetchedAt)}`
            : "Steam is not responding. Check the source."}
        </small>
      </div>
    </a>
  );
}
export async function PriceFact() {
  const data = await getPrice();
  return (
    <a className={styles.fact} href="/price/">
      <Icon name="tag" />
      <div>
        <strong>Price</strong>
        <span>
          {data.price
            ? `${data.price.final_formatted} · US / USD`
            : "Check Steam pricing"}
        </span>
      </div>
    </a>
  );
}
