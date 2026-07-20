#!/bin/bash
echo "=== Cleaning old build ==="
rm -rf backend/public/assets

echo "=== Building frontend ==="
cd frontend
npm install --include=dev
npm run build
cd ..

echo "=== Installing backend ==="
cd backend
npm install
cd ..

echo "=== Build complete ==="
ls -la backend/public/
ls -la backend/public/assets/
