#!/bin/bash
set -e

echo "=============================================="
echo "  FLS School - Package Creation for Friends"
echo "=============================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo ""
echo "Select packaging mode:"
echo "1) Lightweight Source Zip (Recommended, ~2MB) - Friend runs 'docker compose up --build -d'"
echo "2) Full Docker Images Tar (~450MB) - Friend only needs Docker (no build required)"
echo "3) Both"
echo ""

MODE=${1:-1}

if [ "$MODE" = "1" ] || [ "$MODE" = "3" ]; then
  ZIP_NAME="fls-school-docker.zip"
  echo "--> Creating lightweight source archive: $ZIP_NAME..."
  rm -f "$ZIP_NAME"
  zip -r "$ZIP_NAME" \
    docker-compose.yml \
    README_DOCKER.md \
    start.sh \
    start.bat \
    stop.sh \
    stop.bat \
    fls-backend/ \
    fls-admin/ \
    -x "*/node_modules/*" \
    -x "*/dist/*" \
    -x "*.git*" \
    -x "*.tar*" \
    -x "*.zip" \
    -x "*/.cache/*" > /dev/null
  echo "✔ Successfully created $ZIP_NAME ($(du -h "$ZIP_NAME" | cut -f1))"
fi

if [ "$MODE" = "2" ] || [ "$MODE" = "3" ]; then
  TAR_NAME="fls-school-images.tar.gz"
  echo "--> Building images if needed..."
  docker compose build
  echo "--> Exporting Docker images to compressed archive: $TAR_NAME..."
  docker save fls-frontend:latest fls-backend:latest mongo:7 | gzip > "$TAR_NAME"
  echo "✔ Successfully created $TAR_NAME ($(du -h "$TAR_NAME" | cut -f1))"
fi

echo ""
echo "Packaging complete!"
