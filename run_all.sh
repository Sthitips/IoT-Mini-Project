#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/ansuman30/Music/IOT_SOIL"
BACKEND_DIR="$ROOT_DIR/soil-monitor-backend"
FRONTEND_DIR="$ROOT_DIR/soil-monitor-frontend"

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 22 >/dev/null
fi

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing dependency: $1"
    exit 1
  }
}

check_cmd curl

if command -v fuser >/dev/null 2>&1; then
  fuser -k 8000/tcp >/dev/null 2>&1 || true
  fuser -k 5173/tcp >/dev/null 2>&1 || true
else
  for pid in $(ss -ltnp '( sport = :8000 or sport = :5173 )' | awk 'NR>1 {print $NF}' | sed -E 's/.*pid=([0-9]+).*/\1/' | sort -u); do
    kill "$pid" || true
  done
fi

echo "Starting backend..."
cd "$BACKEND_DIR"
if [ -f .venv/bin/python3 ]; then
  ./.venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/soil_backend.log 2>&1 &
else
  python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/soil_backend.log 2>&1 &
fi

echo "Starting frontend..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/soil_frontend.log 2>&1 &

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8000/ >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

for i in $(seq 1 30); do
  if curl -fsS -I http://localhost:5173/ >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo ""
echo "=== SYSTEM CHECK ==="

echo "- Backend root:"
curl -sS http://127.0.0.1:8000/ | head -c 200

echo ""
echo "- Frontend root:"
curl -sS -I http://localhost:5173/ | head -n 1

echo ""
echo "- MQTT broker: external HiveMQ Cloud (configured via environment variables)"

echo ""
LAN_IP=$(hostname -I | awk '{print $1}')

echo "Project is running."
echo "Backend: http://${LAN_IP:-127.0.0.1}:8000"
echo "Frontend: http://${LAN_IP:-127.0.0.1}:5173"
echo "Make sure your backend .env contains the HiveMQ Cloud host, username, password and TLS settings."
