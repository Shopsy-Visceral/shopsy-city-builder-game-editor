# Releasing a build

Builds are shared as **GitHub Releases on this repo**. Not Drive links, not a folder handed over
on disk. One tag, one release, one zip, and the version in the tag is the version that goes live.

Same procedure as the Hike games (`hike-traffic-racer`, `hike-ludo-game`) and the Unity Shopsy games
(`shopsy-goods-triple-game`, `shopsy-ludo-game`, `shopsy-match3-game`). This game is **Phaser 3 +
Vite**, not Unity, so the Unity player-settings and `Build/*` naming rules do not apply here; the
equivalents are listed below.

## This game

| | |
|---|---|
| Repo | `Shopsy-Visceral/shopsy-city-builder-game-editor` |
| `gameId` the build sends | `city-builder` (`src/utils/config.ts`) |
| CDN folder | `city-builder/` |
| Public URL | **TBD: Shopsy's CDN host is not documented in any Shopsy repo. Confirm with the platform team before the first CDN promotion.** |
| Last tag before this doc | `v1.1.4` (2026-06-23, no GitHub Release) |
| **Next release** | **`v1.1.5`** |

## Version numbers

`vMAJOR.MINOR.PATCH`, dots not dashes. Keep `version` in `package.json` in step with the tag.

| Bump | When |
|---|---|
| PATCH | Bug fixes, art tweaks, tuning. Nothing the SDK or backend has to know about. |
| MINOR | New feature, new screen, new mode. Still backward compatible. |
| MAJOR | You changed something in **Invariants** below. Tell the platform team first. |

One tag per build. Never move or delete a published tag.

## Which branch

**`main`.** Always. Merge your work to `main` first, then tag `main`.

## Cutting a release

```sh
# 1. get your work onto main
git checkout main && git pull
git merge --no-ff your-branch          # or merge the PR on GitHub
# bump "version" in package.json to match, commit
git push

# 2. build (Vite bundle + phaser-asset-pack-hashing, output in dist/)
npm run build

# 3. boot test the production build behind the mock SDK (see below), portrait viewport

# 4. package: validates the contract and writes build-info.json, zip lands in release/
./scripts/package-release.sh 1.1.5 dist

# 5. publish
gh release create v1.1.5 --target "$(git rev-parse HEAD)" \
  --title "city-builder v1.1.5" \
  --notes "what changed, in one or two lines" \
  release/city-builder-v1.1.5-webgl.zip \
  release/build-info.json
```

`package-release.sh` refuses to package a build that breaks the contract below, so if it passes the
zip is safe to publish.

## What the zip must contain

The Vite output root, exactly as `npm run build` emits it, plus the manifest:

```
index.html
style.css
favicon.png
build-info.json                       <- written by the packaging script
assets/index-<hash>.js
assets/phaser-<hash>.js
assets/asset-pack.json                <- every url carries ?h=<md5>
assets/preload-asset-pack.json
assets/images/... assets/animations/... assets/fonts/... assets/sfx/...
```

**Cache busting.** Harsha's rule is "every release gets unique filenames" because browsers cache
aggressively and a redeploy that reuses a filename serves the old game behind a fresh `index.html`.
Here that is met without renaming: Vite content-hashes the two JS bundles, and
`phaser-asset-pack-hashing` (second half of `npm run build`) appends `?h=<md5>` to every asset URL in
the packs. `package-release.sh` fails if the `?h=` hashes are missing, which is what happens if you
run `vite build` on its own.

There is no `shopsyBridge.browser.js`; the bridge is compiled into the bundle from
`src/shopsystan/shopsyBridge.ts`. `build-info.json` records `"compression": "none"` and
`"unityVersion": "n/a"`; the server serves plain static files.

## Invariants: changing any of these needs a heads-up

- **`gameId`** (`city-builder`) in `src/utils/config.ts`. Catalog lookup, analytics and session records key off it.
- **The bridge contract** in `src/shopsystan/shopsyBridge.ts`: upward via `window.AndroidBridge.postMessage(json)`
  / `webkit.messageHandlers.ShopsyBridge`, downward via `window` `message` events shaped `{type, action, data}`.
- **The reward contract**: the game sends `gems: 0` in `gameCompleted` and the `gameCompletedAck`
  supplies `coinsEarnedForGame`. Rewards are SDK-authoritative.
- **Profile gate**: production boots only after an `updateProfile` with `source: "server"` (`Preload.ts`).
  `import.meta.env.DEV` skips it, so `npm run dev` never exercises this path. Test the built `dist/`.

## Local boot test before publishing

The mock harness is tracked in-repo at `builds/serve.js` + `builds/mock-sdk.js` (fleet copy, adapted:
the mock is injected before the Vite module script, and replies via `window.postMessage`).

    node builds/serve.js dist 8092 --mock

Or `release-boot-test` in `.claude/launch.json`. Open in a **portrait** viewport. Success signals in
the console: `[MockSDK] -> game updateProfile`, then the start panel shows `MockTester` under the
mascot. Play a round to the end to confirm `gameCompletedAck` clears "Please Wait...".

## Where it goes after you publish

Publishing uploads a versioned artifact; it does not put the build in front of users. **The promotion
path for Shopsy is not documented.** Confirm with the platform team who pulls the release and where it
lands before promising a URL. The repo is private, so the release link 404s for anyone outside
`Shopsy-Visceral`.
