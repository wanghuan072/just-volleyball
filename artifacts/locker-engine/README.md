# Locker player assets

## Website runtime

Locker and Shop now use Three.js and OrbitControls in the visitor’s browser. They load the original exported game meshes and face textures from `public/models/locker/`. They do not call `/api/locker/render/`, launch Godot, generate an angle sheet, or require a rendering server.

The body retains editable morph targets. Hair, facial hair and enabled accessories load on demand and are reused from an in-memory asset cache. Pointer movement renders a new camera angle immediately. Model data is checked into the repository, so a normal website deployment includes it without a native engine or cloud service.

Appearance codes are decoded locally. Exports use the game’s JV1 envelope: DEFLATE JSON, CRC32 and Base64. Both JV1 and JV2 imports remain supported. Player PNG exports embed the appearance code in the original `jvlook` chunk format. Presets stay in browser localStorage, and the existing card Studio remains a browser compositor. None of these actions modifies a Steam profile or purchases game items.

## Updating original assets offline

These steps are only needed when updating the recovered game resources, not when building or deploying the website:

1. Run `python artifacts/locker-engine/prepare.py` with `JV_SOURCE_PROJECT` pointing to the recovered project if its path differs from this workstation.
2. Run `node scripts/prepare-locker-web.mjs` to prepare model export jobs and the static asset index.
3. Build the isolated pack with the installed engine’s `--headless --script <absolute path to artifacts/locker-engine/build-project.gd>`. On Windows use `Start-Process -WindowStyle Hidden -Wait` and require `LOCKER_PACK_RESULT=0`.
4. Run that pack with the absolute path to `artifacts/locker-web/export.json` after `--`. The driver loads `scripts/export-locker-web.gd` and writes the original meshes as GLB, baking the static portrait pose while keeping editable body shape targets.
5. To update face textures, pass a JSON request containing `web_export: true` and `face_assets: <absolute public/models/locker/faces path>`. Copy the original `game/fonts/VarsityTeam-Bold.otf` into `public/fonts/` when updating its font.

Machine paths, generated engine packs and temporary jobs remain ignored by Git. The recovered project and Steam installation are not modified. The older native endpoint and verification script are retained for offline comparison, but they are not dependencies of the web editor.

## Verification and scope

`npm test` checks code round trips and CRCs, PNG metadata, enabled accessory coverage and original body morph targets. Type checking, linting and production builds run without a rendering engine. Browser acceptance checks include changing skin/hair, Shop try-on, and moving the camera before the mouse button is released.

The browser uses original geometry and artwork with web lighting and outlines. This is not a claim of pixel-identical game shaders, animations or automatic accessory fitting. Voice settings and additional imported configuration are preserved; voice playback and the complete in-game Studio are not simulated. Four supporter resources disabled in the original build remain disabled in the UI.
