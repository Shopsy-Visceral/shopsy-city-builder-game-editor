#!/usr/bin/env bash
# Package a built WebGL folder into the release zip + build-info.json.
# Validates the build contract in RELEASING.md and refuses to package a bad build.
#
#   ./scripts/package-release.sh <version> <path-to-webgl-build-dir>
#   e.g. ./scripts/package-release.sh 1.1.5 dist      (Vite output; `npm run build` first)
#
# Adapted from shopsy-goods-triple-game/scripts/package-release.sh (Harsha's release flow).
# why: this is a Phaser/Vite game, so the build root is dist/ and the zip goes to release/
#      instead of dist/ - otherwise the zip would be written inside the folder being zipped.
# Differences from the Hike original: GAME_ID/CDN_PATH, and the bridge file is
# shopsyBridge.browser.js rather than hikeBridge.browser.js.
set -euo pipefail

GAME_ID="city-builder"
CDN_PATH="city-builder"
BRIDGE="shopsyBridge.browser.js"

VERSION="${1:-}"
SRC="${2:-}"
[ -n "$VERSION" ] && [ -n "$SRC" ] || { echo "usage: $0 <version> <webgl-build-dir>" >&2; exit 1; }
VERSION="${VERSION#v}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "version must be MAJOR.MINOR.PATCH, got '$VERSION'" >&2; exit 1; }
[ -d "$SRC" ] || { echo "not a directory: $SRC" >&2; exit 1; }

fail() { echo "  FAIL: $*" >&2; BAD=1; }
BAD=0

echo "Packaging $GAME_ID v$VERSION from $SRC"

# --- contract checks -------------------------------------------------------
[ -f "$SRC/index.html" ] || fail "no index.html"
if [ -d "$SRC/Build" ] && [ ! -f "$SRC/$BRIDGE" ]; then
  fail "no $BRIDGE - the SDK bridge must ship with the build"
fi
# Unity emits Build/; a Vite/Phaser game emits hashed assets instead. Detect which,
# because the filename rule only applies to the Unity layout.
if [ -d "$SRC/Build" ]; then LAYOUT=unity; else LAYOUT=web; fi

# Every Build/* file must carry this version, so nothing collides with a past release.
if [ "$LAYOUT" = unity ]; then
  for f in "$SRC"/Build/*; do
    [ -e "$f" ] || continue
    b="$(basename "$f")"
    case "$b" in
      "$GAME_ID-v$VERSION".*) ;;
      *) fail "Build/$b is not named $GAME_ID-v$VERSION.* - rename it (see RELEASING.md)";;
    esac
  done
fi

# Compression: expect brotli. Warn rather than fail so an intentional change can ship,
# but it must be declared, because the server needs different headers per format.
COMPRESSION="none"
if [ "$LAYOUT" = web ]; then
  COMPRESSION="none"
elif ls "$SRC"/Build/*.unityweb >/dev/null 2>&1; then
  COMPRESSION="brotli-unityweb"
elif ls "$SRC"/Build/*.br >/dev/null 2>&1; then
  COMPRESSION="brotli-raw"
  echo "  WARN: raw .br build - only deploy where the server sends Content-Encoding: br."
  echo "        Recorded in build-info.json so the deploy side can set headers."
elif true; then
  COMPRESSION="none"
  echo "  WARN: uncompressed build - this ships $(du -sh "$SRC" | cut -f1) over the wire"
fi

# index.html must reference files that actually exist. Unity's template never
# writes a literal "Build/x" - it concatenates buildUrl + "/x" - so matching on
# "Build/..." finds nothing and silently passes everything. Handle both spellings,
# and treat "found no references at all" as a failure rather than as success.
if [ "$LAYOUT" = unity ]; then
  # `|| true` on both greps: no-match returns 1, and under `set -e` that would
  # abort the script mid-check, which reads exactly like a pass.
  REFS=$( { grep -oE 'buildUrl[[:space:]]*\+[[:space:]]*"/[A-Za-z0-9._-]+"' "$SRC/index.html" 2>/dev/null | sed 's|.*"/||; s|"$||' || true
            grep -oE '"Build/[A-Za-z0-9._-]+"' "$SRC/index.html" 2>/dev/null | sed 's|"Build/||; s|"$||' || true
          } | sort -u )
  if [ -z "$REFS" ]; then
    fail "could not read any Build/* references out of index.html - refusing rather than passing a check that examined nothing"
  fi
  for ref in $REFS; do
    [ -e "$SRC/Build/$ref" ] || fail "index.html loads Build/$ref which is not in the build"
  done
fi

if [ "$LAYOUT" = web ]; then
  REFS=$(grep -oE '(src|href)="\./[A-Za-z0-9._/-]+"' "$SRC/index.html" | sed 's|.*="\./||; s|"$||' | sort -u || true)
  [ -n "$REFS" ] || fail "index.html references no local files - refusing a check that examined nothing"
  for ref in $REFS; do [ -e "$SRC/$ref" ] || fail "index.html loads $ref which is not in the build"; done
  # Vite content-hashes the bundles and phaser-asset-pack-hashing appends ?h= to every asset URL,
  # so the "unique filenames per release" rule is met without renaming anything.
  grep -q '?h=' "$SRC/assets/asset-pack.json" 2>/dev/null || fail "asset-pack.json has no ?h= hashes - run \`npm run build\`, not vite build alone"
fi

[ "$BAD" = 0 ] || { echo "Refusing to package - fix the above." >&2; exit 1; }

# --- manifest --------------------------------------------------------------
COMMIT="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
UNITY="$(awk '/m_EditorVersion:/{print $2; exit}' ProjectSettings/ProjectVersion.txt 2>/dev/null || echo n/a)"

if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "HEAD" ]; then
  echo "  WARN: packaging from '$BRANCH' - releases are cut from main (RELEASING.md)"
fi

mkdir -p release
find_build() { ls "$SRC"/Build/ 2>/dev/null | grep -E "$1" | head -1; }
cat > "$SRC/build-info.json" <<JSON
{
  "gameId": "$GAME_ID",
  "version": "$VERSION",
  "cdnPath": "$CDN_PATH/v$VERSION",
  "commit": "$COMMIT",
  "branch": "$BRANCH",
  "compression": "$COMPRESSION",
  "unityVersion": "$UNITY",
  "buildFiles": {
    "loader": "$(find_build '\.loader\.js$')",
    "framework": "$(find_build '\.framework\.js(\.br|\.unityweb)?$')",
    "data": "$(find_build '\.data(\.br|\.unityweb)?$')",
    "wasm": "$(find_build '\.wasm(\.br|\.unityweb)?$')"
  },
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
cp "$SRC/build-info.json" release/build-info.json

ZIP="release/$GAME_ID-v$VERSION-webgl.zip"
rm -f "$ZIP"
if command -v zip >/dev/null 2>&1; then
  (cd "$SRC" && zip -qr "$OLDPWD/$ZIP" .)
else
  # Windows Git Bash ships no `zip`; produce the identical archive (build root at the top level).
  python - "$SRC" "$ZIP" <<'PY'
import os, sys, zipfile
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(src):
        dirs.sort()
        for f in sorted(files):
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, src).replace(os.sep, "/"))
PY
fi

echo "  ok  $ZIP  ($(du -h "$ZIP" | cut -f1), compression=$COMPRESSION)"
echo
echo "Publish with:"
echo "  gh release create v$VERSION --title \"$GAME_ID v$VERSION\" --notes \"...\" \\"
echo "    $ZIP release/build-info.json"
