#!/usr/bin/env bash
set -euo pipefail

echo "Unpacking app.zip..."
rm -rf app PersonalServices
unzip -q app.zip

# Normalize folder name to ./app
if [ -d "PersonalServices" ]; then
  mv PersonalServices app
elif [ -d "app" ]; then
  : # ok
else
  echo "ERROR: Expected folder 'PersonalServices' or 'app' after unzip."
  ls -la
  exit 1
fi

cd app

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Build finished."
