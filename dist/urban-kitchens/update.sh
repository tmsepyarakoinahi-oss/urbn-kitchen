#!/bin/bash
# ============================================
# Urban Kitchens - Update Script
# Run this after pulling new code changes
# ============================================
set -e

APP_DIR="/var/www/urban-kitchens"

echo "🔄 Updating Urban Kitchens..."

# Step 1: Build new version locally or on server
echo "[1/4] Building production bundle..."
cd /home/$USER/urban-kitchens-source
npm run build

# Step 2: Copy new files
echo "[2/4] Deploying new files..."
cp -r .next/standalone/* ${APP_DIR}/

# Step 3: Update database schema if changed
echo "[3/4] Updating database..."
cd ${APP_DIR}
npx prisma generate
npx prisma db push

# Step 4: Restart application
echo "[4/4] Restarting application..."
pm2 restart urban-kitchens

echo "✅ Update complete!"
pm2 status
