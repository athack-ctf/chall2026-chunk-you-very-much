#!/bin/sh
set -e

SECRET_FILE=/run/victim_session

# Generate secret/cookie per container instance
if [ ! -f "$SECRET_FILE" ]; then
  python - <<'PY'
import secrets, pathlib
p = pathlib.Path("/run/victim_session")
p.write_text(secrets.token_hex(16)) 
PY
  chmod 600 "$SECRET_FILE"
fi

export VICTIM_SESSION="$(cat "$SECRET_FILE")"

exec gunicorn \
  --capture-output \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  --workers 1 \
  --threads 8 \
  --bind 0.0.0.0:8000 app:app
