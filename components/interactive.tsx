"use client";
import { useState } from "react";
import { Icon } from "./icon";
import { checkCode } from "@/lib/check-code";
import styles from "@/styles/site.module.css";
export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied!");
    } catch {
      setStatus("Copy unavailable. Select the code below.");
    }
  }
  return (
    <div className={styles.copyWrap}>
      <button type="button" className={styles.copyButton} onClick={copy}>
        <Icon name={status === "Copied!" ? "check" : "copy"} />
        {status === "Copied!" ? "Copied!" : "Copy Code"}
      </button>
      <span role="status" className={styles.copyStatus}>
        {status}
      </span>
      {status && status !== "Copied!" && (
        <textarea
          aria-label="Code for manual copying"
          readOnly
          value={code}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
export function CodeChecker() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkCode>> | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  return (
    <form
      className={styles.checker}
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try { setResult(await checkCode(value)); }
        finally { setPending(false); }
      }}
    >
      <label htmlFor="character-code">Your character code</label>
      <textarea
        id="character-code"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult(null);
        }}
        spellCheck={false}
        placeholder="Paste your JV1: or JV2: code here"
        disabled={pending}
        rows={5}
      />
      <button className={styles.primaryButton} type="submit" disabled={pending}>
        <Icon name="code" />
        {pending ? "Decoding…" : "Decode & check"}
      </button>
      {result && (
        <div className={styles.notice} role="status">
          <p>{result.message}</p>
          {result.look && <dl className={styles.decodedLook}>
            <div><dt>Hair resource</dt><dd>{result.look.hair || "Bald"}</dd></div>
            <div><dt>Jersey number</dt><dd>{result.look.number}</dd></div>
            <div><dt>Accessory IDs</dt><dd>{result.look.accessories.join(", ") || "None"}</dd></div>
            {result.look.unknownResources.length > 0 && <div><dt>Needs review</dt><dd>{result.look.unknownResources.join(", ")}</dd></div>}
          </dl>}
        </div>
      )}
      <p className={styles.sourceNote}>
        Decoded in your browser; your code is not uploaded. Checks the game
        1.0.3 checksum and data structure, including legacy JV1. Appearance,
        accessory ownership and future game versions still need in-game checks.
      </p>
    </form>
  );
}
