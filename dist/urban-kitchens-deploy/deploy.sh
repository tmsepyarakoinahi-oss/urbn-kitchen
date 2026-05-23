#!/bin/bash
# ============================================================
# Urban Kitchens - Hostinger VPS Deployment Script
# ============================================================
# Requirements: Ubuntu 20.04+ / Debian 11+ VPS on Hostinger
# Run as root or with sudo
# ============================================================

set -e

echo "🚀 Urban Kitchens — Hostinger VPS Deployment"
echo "=============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./deploy.sh)${NC}"
    exit 1
fi

APP_DIR="/opt/urban-kitchens"
APP_USER="urbankitchen"

# Step 1: Install Node.js 20
echo -e "${YELLOW}[1/7] Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) installed${NC}"

# Step 2: Install PM2
echo -e "${YELLOW}[2/7] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo -e "${GREEN}PM2 installed${NC}"

# Step 3: Install Nginx
echo -e "${YELLOW}[3/7] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi
echo -e "${GREEN}Nginx installed${NC}"

# Step 4: Create app user and copy files
echo -e "${YELLOW}[4/7] Setting up application...${NC}"
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -m -s /bin/bash $APP_USER
fi

# Copy application files
mkdir -p $APP_DIR
# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy all files from the deployment package
rsync -a --exclude='deploy.sh' --exclude='update.sh' --exclude='DEPLOY.md' --exclude='nginx.conf' "$SCRIPT_DIR/" "$APP_DIR/"

# Create logs directory
mkdir -p $APP_DIR/logs

# Ensure database directory exists and has the DB
mkdir -p $APP_DIR/db
if [ -f "$SCRIPT_DIR/db/custom.db" ]; then
    cp "$SCRIPT_DIR/db/custom.db" "$APP_DIR/db/custom.db"
    echo -e "${GREEN}Database file copied${NC}"
else
    echo -e "${YELLOW}No existing database found — will be created on first run${NC}"
fi

# Set ownership
chown -R $APP_USER:$APP_USER $APP_DIR

echo -e "${GREEN}Application files copied to $APP_DIR${NC}"

# Step 5: Install production dependencies and generate Prisma client
echo -e "${YELLOW}[5/7] Installing production dependencies...${NC}"
cd $APP_DIR

# Generate Prisma client (the standalone build includes node_modules but may need prisma generate)
npx prisma generate 2>/dev/null || true

# Ensure the DATABASE_URL in .env uses a relative path suitable for the install location
if grep -q "DATABASE_URL=file:/home/" "$APP_DIR/.env" 2>/dev/null; then
    sed -i 's|DATABASE_URL=file:.*|DATABASE_URL=file:./db/custom.db|' "$APP_DIR/.env"
    echo -e "${GREEN}Fixed DATABASE_URL to use relative path${NC}"
fi

echo -e "${GREEN}Dependencies ready${NC}"

# Step 6: Start the application with PM2 (seed endpoint is disabled in production)
echo -e "${YELLOW}[6/7] Starting application with PM2...${NC}"
cd $APP_DIR

# Stop any existing instance
pm2 delete urban-kitchens 2>/dev/null || true

# Start the app
pm2 start ecosystem.config.js

# Save PM2 process list for auto-restart on reboot
pm2 save

# Configure PM2 to start on system boot
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER 2>/dev/null || pm2 startup 2>/dev/null || true

echo -e "${GREEN}Application started${NC}"

# Step 7: Configure Nginx
echo -e "${YELLOW}[7/7] Configuring Nginx...${NC}"
if [ -f "$SCRIPT_DIR/nginx.conf" ]; then
    cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/urban-kitchens
    ln -sf /etc/nginx/sites-available/urban-kitchens /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test nginx config
    nginx -t 2>/dev/null && systemctl reload nginx || echo -e "${YELLOW}Nginx config needs domain update — edit /etc/nginx/sites-available/urban-kitchens${NC}"
else
    echo -e "${YELLOW}nginx.conf not found in package. Configure manually (see DEPLOY.md)${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Application deployed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your SMTP credentials:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Update nginx.conf with your domain:"
echo "   nano /etc/nginx/sites-available/urban-kitchens"
echo "   # Replace 'yourdomain.com' with your actual domain"
echo "   sudo sed -i 's/yourdomain.com/YOURACTUALDOMAIN.com/g' /etc/nginx/sites-available/urban-kitchens"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "3. Setup SSL with Certbot:"
echo "   sudo apt install certbot python3-certbot-nginx -y"
echo "   sudo certbot --nginx -d YOURACTUALDOMAIN.com -d www.YOURACTUALDOMAIN.com"
echo ""
echo "4. Restart the app after .env changes:"
echo "   pm2 restart urban-kitchens"
echo ""
echo "Useful commands:"
echo "  pm2 status                    — Check app status"
echo "  pm2 logs                      — View logs"
echo "  pm2 restart urban-kitchens    — Restart app"
echo "  pm2 stop urban-kitchens       — Stop app"
echo "  pm2 monit                     — Live monitoring"
echo ""
echo "Your app is running on http://$(hostname -I | awk '{print $1}'):3000"
