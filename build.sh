#!/bin/bash
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
