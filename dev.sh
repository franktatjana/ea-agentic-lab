#!/usr/bin/env bash
# Start EA Agentic Lab locally: FastAPI backend (:8000) + Next.js frontend (:3000)
# Usage: ./dev.sh        Press Ctrl+C to stop both.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$ROOT/application"
PY="$APP/venv/bin/python"

if [ ! -x "$PY" ]; then
  echo "Error: venv not found at $APP/venv" >&2
  echo "Create it with:" >&2
  echo "  python3 -m venv $APP/venv && $APP/venv/bin/python -m pip install -r $APP/requirements.txt" >&2
  exit 1
fi

cleanup() {
  trap - INT TERM EXIT
  echo
  echo "Stopping EA Agentic Lab..."
  pkill -P $$ 2>/dev/null || true
  pkill -f "uvicorn src.api.main:app" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "Starting EA Agentic Lab"
echo "  Backend  -> http://127.0.0.1:8000  (API docs: /docs)"
echo "  Frontend -> http://localhost:3000"
echo

( cd "$APP" && DEBUG=true exec "$PY" -m uvicorn src.api.main:app --reload --port 8000 ) &
( cd "$APP/frontend" && exec npm run dev ) &

wait
