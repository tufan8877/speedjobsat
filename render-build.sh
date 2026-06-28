#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
npm install

echo "Pushing database schema..."
npm run db:push

echo "Building app..."
npm run build

echo "Build finished."
