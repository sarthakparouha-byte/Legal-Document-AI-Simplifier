#!/bin/bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Build frontend
cd frontend
npm install --legacy-peer-deps
npm run build

# Move build files to backend static directory
mkdir -p ../backend/static
cp -r build/* ../backend/static/

# Return to root
cd ..
