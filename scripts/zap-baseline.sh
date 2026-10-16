#!/usr/bin/env bash
# OWASP ZAP baseline (passive) scan via Docker.
# Usage: BASE_URL=https://example.com scripts/zap-baseline.sh [extra zap-baseline.py args]
# Exit code: 0 = no FAIL-level alerts (warnings allowed), non-zero otherwise.
set -euo pipefail
TARGET="${BASE_URL:-http://127.0.0.1:3000}"
OUT="${ZAP_OUT:-reports/zap}"
IMAGE="${ZAP_IMAGE:-ghcr.io/zaproxy/zaproxy:stable}"
mkdir -p "$OUT"
chmod 777 "$OUT"
cp -f security/zap-rules.tsv "$OUT/rules.tsv"
echo "ZAP baseline -> $TARGET"
docker run --rm --network host -v "$(pwd)/$OUT:/zap/wrk:rw" "$IMAGE" \
  zap-baseline.py -t "$TARGET" -c rules.tsv -r zap-report.html -J zap-report.json -w zap-report.md -I "$@"
