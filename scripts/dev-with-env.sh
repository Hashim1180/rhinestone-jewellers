#!/bin/bash
# Loads .env, then runs next dev. Works around inherited DATABASE_URL.
# This is the script invoked when the system runs `bun run dev`.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

unset DATABASE_URL

# Load .env into environment
if [ -f .env ]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    val="${val#\"}"
    val="${val%\"}"
    export "$key=$val"
  done < .env
fi

# Run next dev, capturing logs to dev.log
./node_modules/.bin/next dev -p 3000 2>&1 | tee dev.log
