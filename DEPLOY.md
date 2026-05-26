# Urban Kitchens — Hostinger VPS Deployment Guide

Complete production deployment guide for Hostinger VPS with PM2, Nginx, and SSL.

---

## Quick Deploy (Automated)

If you have the `urban-kitchens-production.tar.gz` archive:

```bash
# 1. Upload to your VPS
scp urban-kitchens-production.tar.gz root@your-server-ip:/tmp/

# 2. SSH into your VPS
ssh root@your-server-ip

# 3. Extract and deploy
cd /tmp
tar -xzf urban-kitchens-production.tar.gz
cd urban-kitchens
chmod +x deploy.sh
./deploy.sh
```

---

## Manual Deployment (Step-by-Step)

### 1. Server Setup

#### 1.1 Connect to Your VPS

```bash
ssh root@your-server-ip
```

#### 1.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Install Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should be v20.x or later
npm -v
```

#### 1.4 Install PM2 Globally

```bash
sudo npm install -g pm2
```

#### 1.5 Install Nginx

```bash
sudo apt install -y nginx
```

#### 1.6 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### 2. Deploy Application Files

#### Option A: From the Production Archive

```bash
mkdir -p /var/www/urban-kitchens
cd /tmp
tar -xzf urban-kitchens-production.tar.gz
cp -r urban-kitchens/* /var/www/urban-kitchens/
```

#### Option B: Build from Source on Server

```bash
cd /home
git clone https://github.com/your-org/urban-kitchens.git
cd urban-kitchens
npm install
npm run build    # Creates .next/standalone/

# Copy to deployment directory
mkdir -p /var/www/urban-kitchens
cp -r .next/standalone/* /var/www/urban-kitchens/
cp -r .next/static /var/www/urban-kitchens/.next/
cp -r public /var/www/urban-kitchens/
cp ecosystem.config.js /var/www/urban-kitchens/
cp nginx.conf /var/www/urban-kitchens/
mkdir -p /var/www/urban-kitchens/prisma
cp prisma/schema.prisma /var/www/urban-kitchens/prisma/
```

---

### 3. Configure Environment

```bash
cd /var/www/urban-kitchens
cp .env.example .env
nano .env
```

**Required values:**

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `file:./db/production.db` | SQLite database path |
| `SMTP_HOST` | `smtp.hostinger.com` | Your SMTP server |
| `SMTP_PORT` | `465` | SMTP port |
| `SMTP_SECURE` | `true` | Use SSL for SMTP |
| `SMTP_USER` | `noreply@yourdomain.com` | SMTP login email |
| `SMTP_PASS` | `your-app-password` | SMTP app password |
| `EMAIL_FROM` | `Urban Kitchens <noreply@yourdomain.com>` | From address |
| `BUSINESS_EMAIL` | `sales@yourdomain.com` | Business inbox |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Your domain URL |
| `NEXTAUTH_SECRET` | *(generate below)* | Auth secret key |
| `PORT` | `3000` | Application port |

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

### 4. Initialize Database

```bash
cd /var/www/urban-kitchens
npm install --production
npx prisma generate
npx prisma db push
```

**Seed the database (creates admin user & sample data):**

```bash
curl -X POST http://localhost:3000/api/seed
```

> ⚠️ Do this BEFORE starting PM2 in production. After seeding, the API will require auth.

---

### 5. Start with PM2

```bash
cd /var/www/urban-kitchens
mkdir -p /var/log/urban-kitchens

# Start the application
pm2 start ecosystem.config.js

# Verify
pm2 status
pm2 logs urban-kitchens

# Enable auto-restart on server reboot
pm2 startup
pm2 save
```

---

### 6. Configure Nginx

```bash
# Copy the included nginx config
sudo cp /var/www/urban-kitchens/nginx.conf /etc/nginx/sites-available/urban-kitchens

# Edit and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/urban-kitchens

# Enable the site
sudo ln -s /etc/nginx/sites-available/urban-kitchens /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. SSL Certificate (Let's Encrypt)

```bash
# Point your domain DNS to your VPS IP first!
# Then run:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

### 8. Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

### 9. DNS Configuration (Hostinger Panel)

In your Hostinger DNS settings:

| Type | Name | Value |
|---|---|---|
| A | @ | your-vps-ip |
| A | www | your-vps-ip |
| AAAA | @ | your-vps-ipv6 (if available) |

---

## Post-Deployment Checklist

- [ ] Application running: `pm2 status`
- [ ] Homepage loads: `curl -I https://yourdomain.com`
- [ ] SSL active: Check padlock in browser
- [ ] Admin panel works: Login at `https://yourdomain.com` → Admin
- [ ] AMC quote form works: Submit a test quote
- [ ] API endpoints respond: `curl https://yourdomain.com/api/products`
- [ ] Email sending works: Configure SMTP and test
- [ ] PM2 auto-restarts: `pm2 startup` configured
- [ ] Server reboots cleanly: `sudo reboot` then check PM2

---

## Ongoing Maintenance

### Update the Application

```bash
cd /home/myuser/urban-kitchens-source
git pull origin main
npm install
npm run build

# Deploy the update
bash update.sh
```

### View Logs

```bash
pm2 logs urban-kitchens
# Or:
tail -f /var/log/urban-kitchens/out.log
tail -f /var/log/urban-kitchens/err.log
```

### Database Backup

```bash
# SQLite backup (simple file copy)
cp /var/www/urban-kitchens/db/production.db /backups/production-$(date +%Y%m%d).db
```

### Monitor Application

```bash
pm2 monit
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| 502 Bad Gateway | PM2 app is down — check `pm2 status` and `pm2 logs` |
| Can't connect on port 3000 | Check if app is listening: `curl http://localhost:3000` |
| SSL errors | Renew cert: `sudo certbot renew` |
| App uses too much memory | Adjust `max_memory_restart` in `ecosystem.config.js` |
| Database locked errors | Ensure only one process accesses the SQLite file |
| Email not sending | Verify SMTP credentials in `.env` |
| Static files 404 | Ensure `.next/static/` exists in deployment directory |
| PM2 not starting on reboot | Run `pm2 startup` and `pm2 save` again |

---

## Production VPS Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| RAM | 1 GB | 2 GB+ |
| CPU | 1 core | 2+ cores |
| Storage | 10 GB | 20+ GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

---

## File Structure (Production)

```
/var/www/urban-kitchens/
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Template for .env
├── server.js               # Next.js standalone server
├── ecosystem.config.js     # PM2 configuration
├── nginx.conf              # Nginx config template
├── deploy.sh               # Automated deployment script
├── update.sh               # Update script
├── package.json            # Dependencies
├── db/
│   └── production.db       # SQLite database
├── prisma/
│   └── schema.prisma       # Database schema
├── .next/
│   ├── static/             # Static assets (cached by CDN/Nginx)
│   └── server/             # Server-side rendering
├── public/                 # Public assets
└── logs/                   # Application logs
```
