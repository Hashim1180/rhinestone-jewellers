#!/bin/bash
# Loads .env, then runs prisma <args>. Works around inherited DATABASE_URL.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

unset DATABASE_URL

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

# First arg is the prisma command (e.g. "db"), rest are args
PRISMA_CMD="$1"
shift
exec ./node_modules/.bin/prisma "$PRISMA_CMD" "$@"
