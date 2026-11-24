# Current verification

Date2026-11-23. Supersedes prior static-only, empty-image and spectator-homepage acceptance.

## Actual rendering

Six listed JV2 codes were decoded by recovered LookShare and rendered with CharacterPortrait.render(full_hd), original player model/hair/face/accessory resources, and a common camera. GDRE engine version4.8-dev, OpenGL compatibility on the available GPU. Source resource version1.0.3. This is an isolated recovered-engine render, not a Steam-gameplay import test.

The isolated PCK disables automatic lifecycle/process/notification/exit callbacks only on15autoload scripts. Player._ready is preserved so ModelRig is created. Userdata was observed at C:/Users/71056/AppData/Roaming/CodexJVOfflineRender, separate from volleyball userdata. Original extraction/install files were not edited. No normal networking or save lifecycle was invoked; no OS-level traffic audit is claimed. The one-off renderer exited0; final stderr is empty. No renderer process remains.

Initial portrait framing clipped Luffy's top accessory; a wider common camera fixed it. Final alpha bounds leave positive margins for all6, including56px above Luffy's halo. A separate visual review inspected all6, matching visible colours/numbers and accessories to decoded fields. The scarf naturally obscures part of Itadori's number. Front-view checks do not certify hidden surfaces or ownership.

## Automated checks

- Lint/TypeScript pass.
-15tests pass, including every portrait's exact input-code SHA256, output-image SHA256 and unclipped alpha bounds, plus real-code decoding, corruption/legacy decoding, data catalogs, source archives, search/pagination and Steam error handling.
- Production build and output checks pass:45concrete prerendered pages,40static metadata sets,1474local links,289image elements,104JSON-LD blocks,45sitemap URLs and1200x630OG image.
- Former third-party /images/skins paths are rejected in rendered output. New player paths are independently generated output under /images/players.

## Browser

Used owner's running localhost:3000. No site service started/restarted.

-1491x1055home: six code-matched PNGs, original three-column/two-row grid, unchanged module positions, no horizontal overflow. Transparent margins are handled by CSS without changing PNG bytes.
- Detail: complete Luffy halo and body visible; matching code, render origin, inputs and accessory ownership notice present. Fixed a grid-stretch issue that originally pushed the detail image down.
- Character-code list renders matching portraits and no broken loaded images.
-375x812home: two responsive columns, six matching player images and no horizontal overflow.
- Proof: home-code-matched-renders.jpg, home-code-matched-renders-mobile.jpg and luffy-code-matched-render.jpg in artifacts/screenshots/.

Remaining limits: live-game imports, individual account rights, all camera views and future game/engine versions. Source-note page exposes these distinctions. No remote deployment performed.
