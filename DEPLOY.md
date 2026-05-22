# Urban Kitchens — Hostinger VPS Deployment Guide

This guide walks you through deploying the Urban Kitchens Next.js application to a Hostinger VPS with PM2, Nginx, and SSL.

---

## 1. Server Setup

### 1.1 Connect to Your VPS

```bash
ssh root@your-server-ip
```

### 1.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should be v20.x or later
npm -v
```

### 1.4 Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx

```bash
sudo apt install -y nginx
```

### 1.6 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Clone & Build

### 2.1 Clone the Repository

```bash
cd /home
mkdir -p myuser
cd myuser
git clone https://github.com/your-org/urban-kitchens.git
cd urban-kitchens
```

### 2.2 Install Dependencies

```bash
npm install
# or if using bun:
# curl -fsSL https://bun.sh/install | bash
# bun install
```

### 2.3 Configure Environment

```bash
cp .env.production.template .env
```

Edit `.env` with your production values:

```bash
nano .env
```

Key values to set:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./db/production.db` |
| `SMTP_HOST` | Your SMTP server, e.g. `smtp.gmail.com` |
| `SMTP_USER` | Email address for sending |
| `SMTP_PASS` | App-specific password (not your login password) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your domain, e.g. `https://urbankitchens.com` |
| `SEED_SECRET` | Random string to protect the seed endpoint |

### 2.4 Initialize the Database

```bash
npx prisma generate
npx prisma db push
```

### 2.5 Seed the Database

The seed endpoint requires a secret token. Set `SEED_SECRET` in your `.env`, then:

```bash
curl -X POST "http://localhost:3000/api/seed?secret=YOUR_SEED_SECRET"
```

> **Note**: The seed endpoint is **blocked in production** (when `NODE_ENV=production`). You must seed before starting the production server, or temporarily set `NODE_ENV=development` to seed.

### 2.6 Build the Application

```bash
npm run build
```

This creates the standalone output in `.next/standalone/`.

---

## 3. PM2 Configuration

### 3.1 Update ecosystem.config.js

Edit `ecosystem.config.js` and update the `cwd` field to match your deployment path:

```javascript
cwd: '/home/myuser/urban-kitchens',
```

### 3.2 Create Logs Directory

```bash
mkdir -p logs
```

### 3.3 Start the Application

```bash
pm2 start ecosystem.config.js
```

### 3.4 Verify It's Running

```bash
pm2 status
pm2 logs urban-kitchens
```

### 3.5 Enable PM2 Startup on Reboot

```bash
pm2 startup
# Run the command PM2 outputs, then:
pm2 save
```

---

## 4. Nginx Reverse Proxy

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/urban-kitchens
```

Paste the following:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/urban-kitchens /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### 4.3 Test & Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL with Let's Encrypt

### 5.1 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically modify your Nginx config for SSL.

### 5.2 Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## 6. Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

This allows SSH (port 22) and HTTP/HTTPS (ports 80/443) while blocking everything else.

---

## 7. Ongoing Maintenance

### Update the Application

```bash
cd /home/myuser/urban-kitchens
git pull origin main
npm install
npm run build
pm2 restart urban-kitchens
```

### View Logs

```bash
pm2 logs urban-kitchens
# Or directly:
tail -f logs/out.log
tail -f logs/err.log
```

### Database Migration

If you make schema changes, run:

```bash
npx prisma db push
# Then restart the app
pm2 restart urban-kitchens
```

### Monitor Application

```bash
pm2 monit
```

---

## 8. Troubleshooting

| Issue | Solution |
|---|---|
| 502 Bad Gateway | PM2 app is down — check `pm2 status` and `pm2 logs` |
| Can't connect on port 3000 | Check if app is listening: `curl http://localhost:3000` |
| SSL errors | Renew cert: `sudo certbot renew` |
| App uses too much memory | Adjust `max_memory_restart` in `ecosystem.config.js` |
| Database locked errors | Ensure only one process accesses the SQLite file |
