# justvolleyball.app: Sitemap and Bing

## Current state

- Canonical origin: https://justvolleyball.app
- GitHub: wanghuan072/just-volleyball, production branch main.
- Vercel project: prj_BPaduhALrl3JNhx9aWIljRq9UpuC. The existing successful Git status context is Vercel and targets whs-projects-f97a952d/just-volleyball.
- Bing site added to the signed-in account on 2026-11-25. The site's own msvalidate.01 value is in app/layout.tsx. **Verify was clicked after the verification deployment and succeeded: the selected site has no Not verified label and its own management reports are accessible.**
- seo/indexnow.json is the shared persistent first-send gate. Bing verification is confirmed for this exact origin. enabled is true and bootstrap is false. Sitemap was submitted on 2026-11-25 and is Processing.

## Page dates and deletion history

The existing business data adapter scripts/update-sitemap-dates.mjs enumerates pages, guides and audited skins. scripts/build-seo-manifest.mjs prepares the same URLs for app/sitemap.ts and public/seo-manifest.json. The initial migration retains all 78 existing calendar dates. Adding Bing verification alone does not mark editorial pages updated.

Production builds read the preceding successfully published manifest at the fixed public origin, never a notification receipt or an event-supplied URL. Read failures are fatal. The first deployment has an explicit bootstrap exception, only while notifications remain disabled; after the first manifest is published, set bootstrap to false. Local builds use seo/production-baseline.json (initially explicit null); to simulate later production changes, copy the actual published manifest into that file first. Generated local manifests are not production history and are ignored by Git.

Deletion events survive subsequent versions and notification failures. Restore clears the old deletion; deleting again creates a new event. The root proxy returns transport-level 404 for unknown content routes, with existing canonical routes and legacy redirects allowed. Added business routes must enter the same data adapter, not a separate manually maintained IndexNow slug list.

## Publication and receipts

.github/workflows/indexnow.yml listens to the existing Vercel success status and has a no-argument manual retry. It only executes trusted main-branch code, checks the repository, event sender, context, project target and the commit in the fixed public production manifest. Preview, failed, unrelated and superseded versions cannot be acknowledged as this release. Automatic triggering is verified by GitHub status workflow run 45588187350 for production commit 8bf2a71eab3543a0eb71f3b85f5e490a7e7c526c. Its notify job completed successfully, submitted 78 URLs in one batch and received HTTP 202.

scripts/run-indexnow.mjs is the single sending entry. scripts/notify-indexnow.mjs validates the live manifest and plain-text key, submits batches with bounded retries, and advances a receipt only after every batch and final version check succeeds. The public random IndexNow key is not a secret or a Bing ownership token.

Successful receipts are GitHub Actions artifacts, retained for 90 days, read only from successful runs of this workflow on main. Restore/download/authentication failures abort. A confirmed absent/expired receipt explicitly bootstraps a full submission, including retained deletions. Upload failure fails the job; the prior acknowledged receipt remains available. Notifications are serialized without cancelling an active run. No database, custom secret or personal token is added.

The previous-production inheritance requires ordered production publishing. Before enabling, confirm Vercel production builds cannot publish interleaved with independent CLI deployments or manual promotions; if these are used, unify the release queue or persist every published content version. Serial notification alone cannot reconstruct a skipped intermediate production version. Direct promotion of an old immutable deployment also brings back its old Sitemap; rebuild rollback content instead.

This workflow covers Git/Vercel editorial releases. The existing separately refreshed Steam price, player and news widgets are not represented as independent editorial IndexNow events. An independent CMS/ISR publishing path must supply its own successful-publication hook before claiming coverage of those changes.

## First online activation sequence

1. Obtain current-task authorization to commit/push these specific files to main, which triggers the existing production deployment. Leave enabled false.
2. Check that Vercel reports READY/production for that commit and that https://justvolleyball.app/ contains the site's verification meta, the public key returns plain text, and /seo-manifest.json is JSON for this project/commit.
3. Return to this site's Bing verification dialog, click Verify, read its success result and open the site's dashboard. Do not infer verification from a public meta tag.
4. Submit https://justvolleyball.app/sitemap.xml or reuse its existing valid entry; record Processing/Success accurately.
5. Record the exact confirmed origin and timestamp in bingVerifiedOrigin/bingVerifiedAt, set enabled true and bootstrap false, and publish that approved change. Verify the actual success event, job, receipt upload and retrieval. A manual workflow run does not prove automatic triggering.
6. Open Search Performance and IndexNow reports for this exact site. New reports can be empty or still preparing; acceptance is not indexing.

## Offline checks and retry

```text
npm run build
npm run indexnow:check
npm test
npm run verify:build
```

indexnow:check is offline and does not write a receipt. indexnow:send also performs no network or receipt operations while the gate is closed. Once verified and enabled, use GitHub Actions → IndexNow production notification → Run workflow on main to retry the current production version. Do not run the generic notifier directly to bypass the first-send gate.

In https://www.bing.com/webmasters/ select **justvolleyball.app** → **IndexNow → IndexNow Insights → View Complete Report** to check URL, submission date and source. This site is verified; Sitemap submission is Processing. The first automatic submission received HTTP 202 at 2026-11-25T09:44:10Z. Receipt artifact 15009133411 (run 45588187350) was downloaded and checked: 78 entries, this canonical origin, and the matching production commit. The receipt is retained until 2027-02-23 unless repository retention settings change. Report entries indicate receipt, not guaranteed indexing or proof that all future deployments trigger automatically.
