# Urban Kitchens — Hostinger VPS Deployment Guide

## ⚠️ Important: This is a FULL-STACK Node.js Application

This is NOT a static website. It's a **Next.js full-stack application** that runs on Node.js and serves both:
- **Frontend**: React pages, HTML, CSS, JavaScript
- **Backend**: API routes (`/api/*`), database operations, email sending

You **CANNOT** deploy this on Hostinger shared hosting (cPanel). You need **Hostinger VPS** or **Cloud Hosting** that supports Node.js.

---

## Hostinger Plan Requirements

| Plan Type | Supported? | Notes |
|-----------|-----------|-------|
| Shared Hosting | ❌ NO | No Node.js support |
| WordPress Hosting | ❌ NO | WordPress only |
| Cloud Hosting | ✅ YES | Full root access |
| VPS Hosting | ✅ YES | Full root access |

**Recommended**: Hostinger VPS (KVM 1 plan minimum — 1 vCPU, 4GB RAM, 50GB SSD)

---

## Architecture Overview

```
Internet → Nginx (SSL/Reverse Proxy) → Node.js (Next.js server.js on port 3000) → SQLite (db/custom.db)
```

- **Nginx**: Handles SSL termination, static asset caching, reverse proxy
- **Node.js (Next.js)**: Runs the standalone server.js, serves both frontend and API routes
- **SQLite**: File-based database, no separate database server needed
- **PM2**: Process manager for auto-restart and monitoring

---

## Package Contents

```
urban-kitchens-deploy/
├── .next/                  # Next.js compiled application
│   └── static/             # Static assets (JS, CSS, images)
├── db/
│   └── custom.db           # SQLite database (pre-seeded)
├── node_modules/           # Production dependencies
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Public assets (logo, robots.txt)
├── .env                    # Environment variables (EDIT THIS!)
├── server.js               # Next.js standalone server
├── package.json            # Project manifest
├── ecosystem.config.js     # PM2 process configuration
├── nginx.conf              # Nginx reverse proxy configuration
├── deploy.sh               # Automated deployment script
├── update.sh               # Update script for new builds
└── DEPLOY.md               # This file
```

---

## Quick Deploy Steps

### 1. Upload files to your VPS

```bash
# Option A: Using SCP
scp urban-kitchens-hostinger.tar.gz root@YOUR_VPS_IP:/root/

# Option B: Using SFTP (FileZilla, WinSCP)
# Upload the entire urban-kitchens-deploy folder to /root/

# Option C: Using rsync (fastest for updates)
rsync -avz urban-kitchens-deploy/ root@YOUR_VPS_IP:/root/urban-kitchens-deploy/
```

### 2. SSH into your VPS

```bash
ssh root@YOUR_VPS_IP
```

### 3. Extract and run the deployment script

```bash
# If you uploaded the tar.gz:
cd /root
tar -xzf urban-kitchens-hostinger.tar.gz -C urban-kitchens-deploy/
cd urban-kitchens-deploy

# Make scripts executable
chmod +x deploy.sh update.sh

# Run the deployment
sudo ./deploy.sh
```

The script will:
1. Install Node.js 20
2. Install PM2 globally
3. Install Nginx
4. Copy files to `/opt/urban-kitchens/`
5. Generate Prisma client
6. Start the application with PM2
7. Configure Nginx

### 4. Configure your domain

```bash
# Edit the Nginx config with your domain
sudo nano /etc/nginx/sites-available/urban-kitchens

# Or use sed to replace the domain name:
sudo sed -i 's/yourdomain.com/YOURACTUALDOMAIN.com/g' /etc/nginx/sites-available/urban-kitchens
sudo sed -i 's/www.YOURACTUALDOMAIN.com/www.YOURACTUALDOMAIN.com/g' /etc/nginx/sites-available/urban-kitchens

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (this will auto-modify nginx config)
sudo certbot --nginx -d YOURACTUALDOMAIN.com -d www.YOURACTUALDOMAIN.com

# Certbot will ask:
# - Email for renewal notifications
# - Agree to terms of service
# - Choose redirect HTTP → HTTPS (recommended: YES)
```

### 6. Configure environment variables

```bash
nano /opt/urban-kitchens/.env
```

Update these values:
```env
# SMTP Email — Use your Hostinger email account
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@yourdomain.com       # Your Hostinger email address
SMTP_PASS=your-email-password       # Your email password
EMAIL_FROM=info@yourdomain.com      # Same as SMTP_USER
BUSINESS_EMAIL=info@yourdomain.com  # Where inquiries are sent

# Seed secret (for initial database setup — disable after use)
SEED_SECRET=urban-kitchens-2024
```

Then restart:
```bash
pm2 restart urban-kitchens
```

### 7. Verify the deployment

```bash
# Check if the app is running
pm2 status

# Check logs
pm2 logs urban-kitchens --lines 50

# Test the API
curl http://127.0.0.1:3000/api
```

You should see a JSON health check response.

---

## Manual Deployment (Alternative)

If you prefer not to use the automated script:

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Install Nginx
sudo apt update && sudo apt install -y nginx

# 4. Copy files to /opt/urban-kitchens
sudo mkdir -p /opt/urban-kitchens
sudo cp -r urban-kitchens-deploy/* /opt/urban-kitchens/
sudo cp urban-kitchens-deploy/.env /opt/urban-kitchens/

# 5. Generate Prisma client
cd /opt/urban-kitchens
npx prisma generate

# 6. Create logs directory
sudo mkdir -p /opt/urban-kitchens/logs

# 7. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 8. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/urban-kitchens
sudo ln -sf /etc/nginx/sites-available/urban-kitchens /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
# Edit the config with your domain, then:
sudo nginx -t && sudo systemctl reload nginx
```

---

## Updating the Application

When you have a new build to deploy:

### Method 1: Using the update script

```bash
# Upload the new package
scp urban-kitchens-hostinger.tar.gz root@YOUR_VPS_IP:/root/

# SSH in and extract
ssh root@YOUR_VPS_IP
cd /root
rm -rf urban-kitchens-deploy
mkdir urban-kitchens-deploy
tar -xzf urban-kitchens-hostinger.tar.gz -C urban-kitchens-deploy/

# Run the update script
cd urban-kitchens-deploy
chmod +x update.sh
./update.sh
```

The update script will:
1. Backup the current database
2. Stop the application
3. Copy new files (preserving .env and database)
4. Regenerate Prisma client
5. Restart the application

### Method 2: Manual update

```bash
# 1. Backup the database
cp /opt/urban-kitchens/db/custom.db /tmp/urban-kitchens-backup.db

# 2. Stop the app
pm2 stop urban-kitchens

# 3. Copy new files (preserve env and database)
rsync -av --exclude='.env' --exclude='db/' --exclude='logs/' \
    urban-kitchens-deploy/ /opt/urban-kitchens/

# 4. Regenerate Prisma client
cd /opt/urban-kitchens && npx prisma generate

# 5. Restart
pm2 start urban-kitchens
```

---

## Database Management

### The SQLite Database

The database is located at `/opt/urban-kitchens/db/custom.db`. It's a file-based SQLite database.

**Important**: The database included in the deployment package is **pre-seeded** with sample data (products, categories, etc.). If you want a fresh start:

```bash
# Stop the app
pm2 stop urban-kitchens

# Remove the existing database
rm /opt/urban-kitchens/db/custom.db

# Push the Prisma schema to create a fresh database
cd /opt/urban-kitchens
npx prisma db push

# Start the app
pm2 start urban-kitchens
```

### Backing up the Database

```bash
# Simple backup
cp /opt/urban-kitchens/db/custom.db /path/to/backup/custom-$(date +%Y%m%d).db

# Automated daily backup (add to crontab)
crontab -e
# Add this line:
# 0 3 * * * cp /opt/urban-kitchens/db/custom.db /opt/urban-kitchens/db/backup/custom-$(date +\%Y\%m\%d).db
```

### Restoring the Database

```bash
pm2 stop urban-kitchens
cp /path/to/backup/custom-YYYYMMDD.db /opt/urban-kitchens/db/custom.db
pm2 start urban-kitchens
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./db/custom.db` | SQLite database path |
| `SMTP_HOST` | For email | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | For email | `587` | SMTP port (465 for SSL, 587 for TLS) |
| `SMTP_USER` | For email | — | SMTP username (your email) |
| `SMTP_PASS` | For email | — | SMTP password |
| `EMAIL_FROM` | For email | `noreply@urbankitchens.com` | Sender email address |
| `BUSINESS_EMAIL` | For email | `info@urbankitchens.com` | Where inquiries are sent |
| `SEED_SECRET` | Optional | — | Secret for database seeding endpoint |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `HOSTNAME` | No | `0.0.0.0` | Server bind address |

---

## Hostinger-Specific Notes

### SMTP Configuration

If your domain is hosted on Hostinger, use these SMTP settings:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@yourdomain.com    # Create this email in Hostinger hPanel
SMTP_PASS=your-email-password     # Set in hPanel → Email → Manage
```

To create an email account:
1. Log into Hostinger hPanel
2. Go to **Email** → **Email Accounts**
3. Click **Create Email Account**
4. Set up `info@yourdomain.com` with a password
5. Use these credentials in your `.env` file

### DNS Configuration

In Hostinger hPanel or your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_VPS_IP |
| A | www | YOUR_VPS_IP |

### Firewall (UFW)

```bash
# Allow necessary ports
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

---

## Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs urban-kitchens --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Try running manually
cd /opt/urban-kitchens
node server.js
```

### 502 Bad Gateway

This means Nginx can't reach the Node.js app:
```bash
# Check if PM2 process is running
pm2 status

# If not, restart it
pm2 restart urban-kitchens

# Check Nginx error log
sudo tail -50 /var/log/nginx/error.log
```

### Email not sending

```bash
# Check your .env configuration
cat /opt/urban-kitchens/.env | grep SMTP

# Test SMTP connection
cd /opt/urban-kitchens
node -e "
  const nodemailer = require('nodemailer');
  const t = nodemailer.createTransport({
    host: 'smtp.hostinger.com', port: 465, secure: true,
    auth: { user: 'YOUR_EMAIL', pass: 'YOUR_PASSWORD' }
  });
  t.verify().then(() => console.log('SMTP OK')).catch(e => console.error('SMTP Error:', e.message));
"
```

### Database errors

```bash
# Check database file
ls -la /opt/urban-kitchens/db/custom.db

# Check DATABASE_URL in .env
grep DATABASE_URL /opt/urban-kitchens/.env

# If database is corrupted, restore from backup
pm2 stop urban-kitchens
cp /path/to/backup/custom.db /opt/urban-kitchens/db/custom.db
pm2 start urban-kitchens
```

### Memory issues

```bash
# Check memory usage
free -h
pm2 monit

# If the app is using too much memory, increase the max_memory_restart
# Edit ecosystem.config.js: max_memory_restart: '2G'
pm2 restart urban-kitchens
```

---

## PM2 Commands Reference

```bash
pm2 start ecosystem.config.js    # Start the app
pm2 stop urban-kitchens          # Stop the app
pm2 restart urban-kitchens       # Restart the app
pm2 delete urban-kitchens        # Remove from PM2
pm2 status                       # Show all processes
pm2 logs                         # View all logs
pm2 logs urban-kitchens          # View app logs
pm2 monit                        # Live monitoring dashboard
pm2 save                         # Save process list (for auto-restart)
pm2 startup                      # Configure auto-start on boot
pm2 flush                        # Clear all logs
```

---

## Security Checklist

- [ ] Change `SEED_SECRET` from the default value
- [ ] Set strong SMTP password
- [ ] Enable UFW firewall (only allow 22, 80, 443)
- [ ] Setup SSL with Certbot
- [ ] Disable root SSH login (use key-based auth)
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Set up automatic database backups
- [ ] Review Nginx security headers

---

## Support

For application issues, check:
1. PM2 logs: `pm2 logs urban-kitchens`
2. Nginx logs: `sudo tail -50 /var/log/nginx/error.log`
3. Application health: `curl http://127.0.0.1:3000/api`
