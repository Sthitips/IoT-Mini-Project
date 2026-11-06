#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/ansuman30/Music/IOT_SOIL"
BROKER_CONF="$ROOT_DIR/mosquitto/mosquitto.conf"
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

check_cmd mosquitto
check_cmd curl

if [ ! -f "$BROKER_CONF" ]; then
  echo "Broker config not found: $BROKER_CONF"
  exit 1
fi

if ! pgrep -x mosquitto >/dev/null; then
  echo "Starting Mosquitto..."
  mosquitto -c "$BROKER_CONF" -d
fi

sleep 1

if ! ss -tulpn | grep -q ':1883 '; then
  echo "Mosquitto is not listening on 1883"
  exit 1
fi

echo "MQTT broker is running on port 1883"

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
./.venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/soil_backend.log 2>&1 &

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

echo "- Broker:"
ss -tulpn | grep 1883 || true

echo "- Backend root:" 
curl -sS http://127.0.0.1:8000/ | head -c 200

echo ""
echo "- Frontend root:" 
curl -sS -I http://localhost:5173/ | head -n 1

echo ""
echo "- MQTT publish test:"
TEST_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
mosquitto_pub -h localhost -p 1883 -t 'soil-monitor/test/readings' -m "{\"device_id\":\"test\",\"raw_value\":1000,\"timestamp\":\"$TEST_TS\"}"
echo "Published test message to MQTT broker"

echo ""
echo "- Latest backend reading check:"
curl -sS 'http://127.0.0.1:8000/api/sensor/latest?device_id=test' || true

echo ""
LAN_IP=$(hostname -I | awk '{print $1}')

echo "Project is running."
echo "Backend: http://${LAN_IP:-127.0.0.1}:8000"
echo "Frontend: http://${LAN_IP:-127.0.0.1}:5173"
echo "Open the frontend URL from your phone on the same Wi‑Fi network."
