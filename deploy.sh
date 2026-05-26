#!/bin/bash
# ============================================
# Urban Kitchens - Deployment Script
# For Hostinger VPS (Ubuntu/Debian)
# ============================================
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Urban Kitchens - Deployment Script${NC}"
echo -e "${GREEN}============================================${NC}"

# ── Configuration ──────────────────────────
APP_DIR="/var/www/urban-kitchens"
APP_USER="www-data"
NODE_VERSION="20"
LOG_DIR="/var/log/urban-kitchens"

# ── Step 1: System Dependencies ───────────
echo -e "${YELLOW}[1/8] Installing system dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx

# ── Step 2: Install Node.js ───────────────
echo -e "${YELLOW}[2/8] Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# ── Step 3: Install PM2 ───────────────────
echo -e "${YELLOW}[3/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "PM2 version: $(pm2 -v)"

# ── Step 4: Setup Application Directory ───
echo -e "${YELLOW}[4/8] Setting up application directory...${NC}"
sudo mkdir -p ${APP_DIR}
sudo mkdir -p ${LOG_DIR}
sudo chown -R $USER:${APP_USER} ${APP_DIR}
sudo chown -R $USER:${APP_USER} ${LOG_DIR}

# ── Step 5: Copy Application Files ────────
echo -e "${YELLOW}[5/8] Deploying application files...${NC}"
# Copy standalone build
cp -r .next/standalone/* ${APP_DIR}/

# Copy additional files
cp ecosystem.config.js ${APP_DIR}/
cp prisma/schema.prisma ${APP_DIR}/prisma/schema.prisma

# Create .env if it doesn't exist
if [ ! -f ${APP_DIR}/.env ]; then
    cp .env.example ${APP_DIR}/.env
    echo -e "${RED}⚠ IMPORTANT: Edit ${APP_DIR}/.env with your production values!${NC}"
fi

# Setup database directory
mkdir -p ${APP_DIR}/db

# ── Step 6: Install Production Dependencies ─
echo -e "${YELLOW}[6/8] Installing production dependencies...${NC}"
cd ${APP_DIR}
npm install --production
npx prisma generate
npx prisma db push

# ── Step 7: Start Application with PM2 ────
echo -e "${YELLOW}[7/8] Starting application with PM2...${NC}"
pm2 delete urban-kitchens 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# ── Step 8: Configure Nginx ───────────────
echo -e "${YELLOW}[8/8] Configuring Nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/urban-kitchens
sudo ln -sf /etc/nginx/sites-available/urban-kitchens /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ── Done! ─────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Edit ${APP_DIR}/.env with your production values"
echo -e "  2. Replace 'yourdomain.com' in /etc/nginx/sites-available/urban-kitchens"
echo -e "  3. Get SSL certificate: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo -e "  4. Restart PM2: pm2 restart urban-kitchens"
echo -e "  5. Seed database: curl -X POST http://localhost:3000/api/seed"
echo ""
echo -e "Useful commands:"
echo -e "  pm2 status          - Check application status"
echo -e "  pm2 logs            - View application logs"
echo -e "  pm2 restart urban-kitchens  - Restart application"
echo -e "  pm2 monit           - Monitor resources"
echo ""
