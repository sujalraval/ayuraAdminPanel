#!/bin/bash
set -e

echo "Deployment started..."

# Pull the latest version of the app
git pull origin main
echo "New changes copied to server !"

echo "Installing Dependencies..."
npm install --yes

echo "Creating Production Build..."
npx vite build --outDir /var/www/ayuraAdminPanel/dist

echo "Deployment Finished!"
