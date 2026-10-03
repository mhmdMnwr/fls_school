#!/bin/sh
set -e

if [ "$SEED_ON_STARTUP" = "true" ]; then
  echo "SEED_ON_STARTUP is enabled: running database seed..."
  npm run db:seed || echo "Seed script completed or skipped."
fi

exec "$@"
