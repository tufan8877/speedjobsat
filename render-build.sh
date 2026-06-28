#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies including dev dependencies..."
npm install --include=dev

echo "Building app..."
npm run build

echo "Build finished."
