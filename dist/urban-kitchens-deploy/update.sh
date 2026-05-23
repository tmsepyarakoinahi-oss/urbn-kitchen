#!/bin/bash
# ============================================================
# Urban Kitchens - Update Script
# ============================================================
# Run this to update the application with a new build
# Upload the new deployment package and run this script
# ============================================================

set -e

APP_DIR="/opt/urban-kitchens"

echo "🔄 Updating Urban Kitchens..."
echo "============================="

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application not found at $APP_DIR"
    echo "   Run deploy.sh first for initial deployment."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Backup current database
echo "📦 Step 1/5: Backing up database..."
BACKUP_FILE="/tmp/urban-kitchens-backup-$(date +%Y%m%d%H%M%S).db"
if [ -f "$APP_DIR/db/custom.db" ]; then
    cp "$APP_DIR/db/custom.db" "$BACKUP_FILE"
    echo "   Database backed up to $BACKUP_FILE"
else
    echo "   No existing database to backup"
fi

# Step 2: Stop the application
echo "🛑 Step 2/5: Stopping application..."
pm2 stop urban-kitchens 2>/dev/null || true

# Step 3: Copy new files
echo "📂 Step 3/5: Copying new files..."
rsync -a \
    --exclude='db/' \
    --exclude='.env' \
    --exclude='logs/' \
    --exclude='deploy.sh' \
    --exclude='update.sh' \
    --exclude='DEPLOY.md' \
    --exclude='nginx.conf' \
    "$SCRIPT_DIR/" "$APP_DIR/"

# Copy new prisma schema if it exists
if [ -f "$SCRIPT_DIR/prisma/schema.prisma" ]; then
    cp "$SCRIPT_DIR/prisma/schema.prisma" "$APP_DIR/prisma/schema.prisma"
fi

# Restore DB if the new package doesn't include one
if [ ! -f "$APP_DIR/db/custom.db" ] && [ -f "$BACKUP_FILE" ]; then
    mkdir -p $APP_DIR/db
    cp "$BACKUP_FILE" "$APP_DIR/db/custom.db"
    echo "   Database restored from backup"
fi

# Step 4: Regenerate Prisma client
echo "⚙️  Step 4/5: Regenerating Prisma client..."
cd $APP_DIR
npx prisma generate 2>/dev/null || true

# Step 5: Start the application
echo "🚀 Step 5/5: Starting application..."
pm2 start urban-kitchens 2>/dev/null || pm2 start ecosystem.config.js

echo ""
echo "✅ Update complete!"
echo ""
pm2 status
