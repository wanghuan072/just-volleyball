import styles from "@/styles/site.module.css";
export function PackageNote({ children }: { children?: React.ReactNode }) {
  return <p className={styles.sourceNote}>{children ?? "Based on game 1.0.3 resources and the bundled manual; controls can be remapped."} <a href="/sources/">Sources & verification</a></p>;
}
