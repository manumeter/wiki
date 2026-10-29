#!/bin/sh
# Refresh the vendored libraries from npm: ./update-vendor.sh [MARKED_VERSION] [HLJS_VERSION]
# (defaults: latest). Extra highlight.js languages = the files already in vendor/languages/.
set -eu
cd "$(dirname "$0")"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

npm pack --silent --pack-destination "$tmp" "marked@${1:-latest}" "@highlightjs/cdn-assets@${2:-latest}" >/dev/null
mkdir "$tmp/marked" "$tmp/hljs"
tar xzf "$tmp"/marked-*.tgz -C "$tmp/marked" --strip-components=1
tar xzf "$tmp"/highlightjs-cdn-assets-*.tgz -C "$tmp/hljs" --strip-components=1

cp "$tmp/marked/lib/marked.umd.js" vendor/
cp "$tmp/marked/LICENSE" vendor/marked.LICENSE
cp "$tmp/hljs/highlight.min.js" vendor/
cp "$tmp/hljs/LICENSE" vendor/highlight.LICENSE
for f in vendor/languages/*.min.js; do
    cp "$tmp/hljs/languages/$(basename "$f")" "$f"
done
echo "updated: marked $(sed -n 's/.*marked v\([0-9.]*\).*/\1/p' vendor/marked.umd.js | head -1)," \
     "highlight.js $(sed -n 's/.*Highlight\.js v\([0-9.]*\).*/\1/p' vendor/highlight.min.js | head -1)"
