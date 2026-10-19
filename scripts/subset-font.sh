#!/usr/bin/env bash
# Rebuilds src/fonts/datum-text.woff2 from upstream Literata.
#
# Not from next/font/google: the css2 API strips the typographic tables this page is built on.
# Measured on 2026-10-19 — upstream Literata has 1,789 glyphs with smcp, c2sc, onum, case, sups
# and frac; the Google-served file has none of them. Upstream also has no mkmk, so it is not in
# the feature list below even though every template includes it.
#
# Requires fontTools with brotli: pip install 'fonttools[woff]'
set -euo pipefail

SRC="${1:-/tmp/font-src/Literata[opsz,wght].ttf}"
OUT="src/fonts/datum-text.woff2"

# Latin-1, the six Turkish extras, the punctuation the prose uses, and the arrows and signs the
# instrument voice needs. Keeping all of Latin Extended-A costs 178 glyphs and 19 KB for nothing.
UNICODES="U+0020-007E,U+00A0-00FF,U+011E-011F,U+0130-0131,U+015E-015F,U+0152-0153,U+0160-0161,\
U+0178,U+017D-017E,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2032-2033,\
U+2039-203A,U+2044,U+20AC,U+20BA,U+2190-2193,U+2212,U+00B1,U+00D7,U+00B0,U+00B7"

pyftsubset "$SRC" \
  --output-file="$OUT" --flavor=woff2 \
  --layout-features="ccmp,liga,kern,mark,locl,smcp,c2sc,onum,lnum,tnum,pnum,case,sups,frac" \
  --unicodes="$UNICODES" --drop-tables+=DSIG --no-hinting

printf '%s  %s KB\n' "$OUT" "$(( $(wc -c < "$OUT") / 1024 ))"
