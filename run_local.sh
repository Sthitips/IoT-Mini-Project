#!/usr/bin/env bash
# ==============================================================================
# 🌱 AgroPulse — Local Development Runner
# Starts both the FastAPI backend and React frontend locally with auto-healing.
#
# Usage:
#   ./run_local.sh            # Run backend and frontend
#   ./run_local.sh --simulate # Run backend, frontend, AND telemetry simulator
#   ./stop_all.sh             # Stop all running services
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/soil-monitor-backend"
FRONTEND_DIR="$ROOT_DIR/soil-monitor-frontend"
SIMULATE=false

if [[ "${1:-}" == "--simulate" || "${1:-}" == "-s" ]]; then
  SIMULATE=true
fi

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}🌱 Starting AgroPulse Local Development Environment${NC}"
echo -e "${GREEN}======================================================${NC}"

# 1. Environment & Dependency Checks
echo -e "\n${BLUE}[1/5] Checking environment...${NC}"

# Setup Node.js from NVM if present
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm use 22 >/dev/null 2>&1 || nvm use default >/dev/null 2>&1 || true
fi

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Error: python3 is required.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm / node is required.${NC}"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required.${NC}"; exit 1; }

# 2. Python Virtual Environment & Requirements
echo -e "${BLUE}[2/5] Preparing backend environment...${NC}"
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  echo -e "Creating Python virtual environment in ${CYAN}.venv${NC}..."
  python3 -m venv .venv
  ./.venv/bin/pip install --upgrade pip >/dev/null 2>&1 || true
  ./.venv/bin/pip install -r requirements.txt
elif [ ! -f ".venv/bin/uvicorn" ]; then
  echo -e "Installing backend dependencies from ${CYAN}requirements.txt${NC}..."
  ./.venv/bin/pip install -r requirements.txt
fi

PYTHON_EXEC="$BACKEND_DIR/.venv/bin/python3"
if [ ! -f "$PYTHON_EXEC" ]; then
  PYTHON_EXEC="python3"
fi

# Ensure local backend .env exists
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

# 3. Node.js Frontend Dependencies
echo -e "${BLUE}[3/5] Preparing frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  echo -e "Installing frontend packages (npm install)..."
  npm install
fi

# 4. Clean up any stale processes on port 8000 or 5173
echo -e "${BLUE}[4/5] Clearing ports 8000 and 5173...${NC}"
if command -v fuser >/dev/null 2>&1; then
  fuser -k 8000/tcp >/dev/null 2>&1 || true
  fuser -k 5173/tcp >/dev/null 2>&1 || true
else
  for pid in $(ss -ltnp '( sport = :8000 or sport = :5173 )' 2>/dev/null | awk 'NR>1 {print $NF}' | sed -E 's/.*pid=([0-9]+).*/\1/' | sort -u); do
    kill -9 "$pid" >/dev/null 2>&1 || true
  done
fi
sleep 1

# 5. Launch Backend & Frontend Services
echo -e "${BLUE}[5/5] Launching background servers...${NC}"

# Launch Backend
cd "$BACKEND_DIR"
nohup "$PYTHON_EXEC" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/soil_backend.log 2>&1 &
disown
echo -e "  ✓ Backend started (logs: ${CYAN}/tmp/soil_backend.log${NC})"

# Launch Frontend
cd "$FRONTEND_DIR"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/soil_frontend.log 2>&1 &
disown
echo -e "  ✓ Frontend started (logs: ${CYAN}/tmp/soil_frontend.log${NC})"

# Optional: Launch Simulator if requested
if [ "$SIMULATE" = true ]; then
  cd "$ROOT_DIR"
  nohup "$PYTHON_EXEC" simulate_esp32.py --interval 2 > /tmp/soil_simulator.log 2>&1 &
  disown
  echo -e "  ✓ ESP32 Simulator started (logs: ${CYAN}/tmp/soil_simulator.log${NC})"
fi

# Health Verification Loop
echo -e "\n${YELLOW}Waiting for services to become healthy...${NC}"

BACKEND_OK=false
FRONTEND_OK=false

for i in $(seq 1 30); do
  if [ "$BACKEND_OK" = false ] && curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
    BACKEND_OK=true
  fi
  if [ "$FRONTEND_OK" = false ] && curl -fsS -I http://127.0.0.1:5173/ >/dev/null 2>&1; then
    FRONTEND_OK=true
  fi
  if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    break
  fi
  sleep 1
done

if [ "$BACKEND_OK" = false ]; then
  echo -e "${RED}Warning: Backend did not respond on /health within 30s.${NC}"
  echo -e "Check /tmp/soil_backend.log for details."
fi

if [ "$FRONTEND_OK" = false ]; then
  echo -e "${RED}Warning: Frontend did not respond on port 5173 within 30s.${NC}"
  echo -e "Check /tmp/soil_frontend.log for details."
fi

# Detect LAN IP
LAN_IP=$(ip -4 addr show scope global 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1 || hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🚀 AgroPulse is LIVE and Running Locally!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "  📱 ${BOLD}Frontend Dashboard:${NC}  ${CYAN}http://localhost:5173${NC}"
echo -e "  📶 ${BOLD}Phone on Same Wi-Fi:${NC} ${CYAN}http://${LAN_IP}:5173${NC}"
echo -e "  ⚙️ ${BOLD}Backend REST API:${NC}    ${CYAN}http://localhost:8000${NC}"
echo -e "  📖 ${BOLD}Swagger API Docs:${NC}    ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  ☁️ ${BOLD}Cloud MQTT Broker:${NC}   ${YELLOW}broker.emqx.io:1883${NC}"
if [ "$SIMULATE" = true ]; then
  echo -e "  🌱 ${BOLD}ESP32 Simulator:${NC}     ${GREEN}ACTIVE (publishing every 2s)${NC}"
else
  echo -e "  💡 ${BOLD}Simulate data:${NC}       Run ${CYAN}./run_local.sh --simulate${NC} or power on your ESP32"
fi
echo -e "  🛑 ${BOLD}To stop all services:${NC} Run ${CYAN}./stop_all.sh${NC}"
echo -e "${GREEN}======================================================${NC}\n"
