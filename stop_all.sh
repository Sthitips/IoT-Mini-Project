#!/usr/bin/env bash
set -euo pipefail

if command -v fuser >/dev/null 2>&1; then
  fuser -k 8000/tcp >/dev/null 2>&1 || true
  fuser -k 5173/tcp >/dev/null 2>&1 || true
else
  for pid in $(ss -ltnp '( sport = :8000 or sport = :5173 )' | awk 'NR>1 {print $NF}' | sed -E 's/.*pid=([0-9]+).*/\1/' | sort -u); do
    kill "$pid" || true
  done
fi

echo "All project services stopped."
