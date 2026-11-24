# Current matched-render status

The six community-code portraits now use actual recovered-engine output, with exact input-code and output-image SHA-256 mappings. See data/portrait-renders.json and artifacts/package-audit/render-visual-check.md. Live-game import and account ownership remain untested. Prior static-only and spectator-substitution decisions below are historical.

---

# Current publication status

The historical withdrawal below was superseded after direct package analysis. Six community presets now pass game 1.0.3 checksum, packed-field and resource checks; actual game imports remain untested. See data/preset-evidence.json, artifacts/package-audit/深入分析.md and /sources/. Source-page agreement alone was never upgraded into a game-test claim.

---

# Content audit — 2026-11-23

## Current publication decision: all six third-party presets withdrawn

The listing-only standard used in the first audit was insufficient. All six records are now excluded from the public catalog, homepage, details, category pages and sitemap. Their preview files were moved out of `public/` into `artifacts/quarantined-skins/`; no copy buttons or preset searches are presented while the verified collection is empty. The original JSON and hashes below are retained only as audit history. They must not be interpreted as approval to republish.

Reinstatement requires an actual current-game import and matching screenshot, a recorded version/test date and resolved attribution. The current public pages explain Locker customization with official Steam media and explain the documented import/export workflow without supplying sample codes. This leaves the usable community-code library explicitly incomplete.

This audit follows the owner's concern that the displayed anime presets looked unlike the game. Official game material, original community submissions, first-person tutorials and derivative guide sites were checked separately. A source match is not an in-game test.

## Corrections made

1. The game advertises a character creator, not an official Hinata/Luffy character roster. The homepage now uses an official Steam Locker screenshot; the six named looks are explicitly presented as community appearance presets.
2. `@community` on JV Locker is a catalog import attribution. It is not a confirmed original creator. All six original-creator fields are now null, with the listing account retained separately.
3. Float Serve previously conflated no directional input with a jump floater. nu's updated mechanics guide distinguishes normal (no input), power (forward), curve (sideways) and jump floater (backward). The page now describes the documented toss/jump/aim/airborne-hit sequence and the backward input, while retaining the independent-testing limitation. The older derivative serve guide was removed as a source.
4. The E-key charge claim now references nu's detailed mechanics guide, which explicitly documents charging. The basic tutorial alone was insufficient for this detail.
5. The official Discord invitation was found in the developer's November 10 Encore Demo announcement and checked through the public invitation API. The Discord page and footer now link it.
6. The Demo's October 19 announcement now has an original developer source rather than a tentative third-party-history reference. Current availability remains a separate question: its store URL still redirects to Steam's homepage.

## Six preset records: what was actually established

| Look         | Source listing            | Exact JV2 string match | Image URL match | Confirmed original creator | Imported by this site |
| ------------ | ------------------------- | ---------------------- | --------------- | -------------------------- | --------------------- |
| Hinata       | https://jvlocker.com/s/90 | Yes, 119 characters    | Yes             | Unknown                    | No                    |
| Kageyama     | https://jvlocker.com/s/91 | Yes, 120 characters    | Yes             | Unknown                    | No                    |
| Gear 5 Luffy | https://jvlocker.com/s/17 | Yes, 239 characters    | Yes             | Unknown                    | No                    |
| Itadori Yuji | https://jvlocker.com/s/24 | Yes, 196 characters    | Yes             | Unknown                    | No                    |
| Nishinoya    | https://jvlocker.com/s/96 | Yes, 144 characters    | Yes             | Unknown                    | No                    |
| Frieren      | https://jvlocker.com/s/78 | Yes, 176 characters    | Yes             | Unknown                    | No                    |

Each individual source page was opened and compared. `data/content-audit.json` records the source URLs, code lengths, code hashes and local-preview hashes of the reviewed records. Those hashes protect the reviewed local data from silent changes; they do not decode a preset or prove current-game acceptance.

JV Locker's own About page explains its community imports: https://jvlocker.com/about . The listing images are character cutouts, not a fixed roster. The six codes were not invented, but they cannot honestly be labeled game-tested. `verified` remains false. Current import success and preview equivalence require a real game session.

## Official information rechecked

- Steam App 5037200: full game released November 16, 2026; Windows listed, macOS/Linux false in appdetails. https://store.steampowered.com/app/5037200/
- An explicit US-region API request returned USD $7.99 list / $4.95 discounted at audit time. This is a dated US lookup, not a worldwide or permanent price. Runtime price remains source/time labeled. https://store.steampowered.com/api/appdetails?appids=5037200&cc=us&l=english
- Existing three update records match the developer's official news API titles, UTC publication dates and contents. The ranked discussion describes future work, not a shipped mode. https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=5037200&count=20&maxlength=0
- Free Nextfest Demo announcement, October 19, 2026: https://store.steampowered.com/news/app/5037200/view/1846651706691057
- Encore Demo / official Discord source, November 10: https://store.steampowered.com/news/app/5037200/view/1848664643360317
- Developer-published invitation: https://discord.gg/kKT98kf2wV . Public invite response resolved to `temkosoft`; no account was joined and no message was sent.
- Hero Locker image: screenshot id 8 from the official Steam appdetails screenshot array, saved at `public/images/game/locker.webp`. Its original full URL is recorded in the JSON audit file.

## Gameplay evidence and remaining limits

- Updated first-person tutorial: https://note.com/asanue/n/ndb85407cc4d2
- Detailed mechanics and jump-serve distinction: https://note.com/asanue/n/n6f14084b0e6a (updated November 21)
- These support the source-based keyboard controls and set/serve descriptions; they do not turn our editorial practice suggestions into independently tested mechanics.
- Original SQRL/DairyusGAMING YouTube links were located through the older build guide. The referenced videos were throttled in this audit; the older source discusses JV1 strings and cannot corroborate these six JV2 codes.
- Another aggregator lists overlapping codes, but its independence is unknown. It was not counted as a second in-game test or an author attribution.
- No character stats, licensed collaboration, unlock method, cosmetic advantage, exact timing value, player peak or history graph was invented to fill a gap.

The remaining independent game tests and resource-rights limits are tracked in DATA_GAPS.md.


