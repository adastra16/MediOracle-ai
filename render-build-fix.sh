#!/bin/bash
# This script ensures vite is available even if it's in devDependencies
# It forces installation of devDependencies during build

cd frontend

# Force install devDependencies even in production
NODE_ENV=development npm install --legacy-peer-deps

# Now build
npm run build

cd ../backend
npm install

