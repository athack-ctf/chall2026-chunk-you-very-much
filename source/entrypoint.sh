#!/bin/sh
set -eu

SECRET_FILE=/run/victim_session
mkdir -p /run

# Generate secret/cookie per container instance
if [ ! -f "$SECRET_FILE" ]; then
  python3 - <<'PY'
import secrets, pathlib
p = pathlib.Path("/run/victim_session")
p.write_text(secrets.token_hex(16))
PY
  chmod 600 "$SECRET_FILE"
fi

export VICTIM_SESSION="$(cat "$SECRET_FILE")"

# Start gunicorn internally
gunicorn \
  --chdir /app/server \
  --capture-output \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  --workers 1 \
  --threads 8 \
  --bind 127.0.0.1:8000 \
  app:app &
GUNICORN_PID=$!

# Start mitmproxy publicly on 8002
mitmdump \
  --mode "reverse:http://${SERVER_HOSTNAME:-127.0.0.1}:${SERVER_PORT:-8000}" \
  -p 8002 \
  -s /app/filter.py \
  --set block_global=false \
  --no-http2 &
MITM_PID=$!

cleanup() {
  kill -TERM "$MITM_PID" "$GUNICORN_PID" 2>/dev/null || true
  wait "$MITM_PID" 2>/dev/null || true
  wait "$GUNICORN_PID" 2>/dev/null || true
}
trap cleanup INT TERM

( wait "$GUNICORN_PID"; kill -TERM "$MITM_PID" 2>/dev/null || true ) &
( wait "$MITM_PID"; kill -TERM "$GUNICORN_PID" 2>/dev/null || true ) &

wait

cleanup
exit 1
