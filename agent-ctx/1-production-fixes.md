# Task 1 - Production-Fixes Agent

## Task
Fix production-critical security and deployment issues for Urban Kitchens Next.js website.

## Completed Work

### 1. Fixed auth.ts (CRITICAL SECURITY)
- **Before**: Hardcoded SHA-256 salt `urban_kitchens_salt_2024` — trivially reversible, no salting per-user
- **After**: bcryptjs with 12 salt rounds — industry standard, adaptive cost, per-user salt
- Installed `bcryptjs@3.0.3` and `@types/bcryptjs@3.0.0`
- Function signatures preserved: `hashPassword(password: string): Promise<string>` and `verifyPassword(password: string, hash: string): Promise<boolean>`

### 2. Fixed next.config.ts (PRODUCTION HARDENING)
- Removed `typescript.ignoreBuildErrors: true` — this was hiding real TypeScript errors
- Set `reactStrictMode: true` — catches common mistakes in development
- Kept `output: "standalone"` for production deployment
- Added 6 security headers applied to all routes:
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - Referrer-Policy: strict-origin-when-cross-origin
  - X-DNS-Prefetch-Control: on
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Permissions-Policy: camera=(), microphone=(), geolocation=()

### 3. Protected Seed API Endpoint
- Added `NODE_ENV === 'production'` check → returns 403 Forbidden
- Added `SEED_SECRET` token validation via `?secret=xxx` query param → returns 403 if missing/mismatched
- Protection applied to both GET and POST handlers
- Existing seed logic unchanged; just guarded

### 4. Created .env.production.template
- Documents all required env vars with sensible defaults
- Includes DATABASE_URL, SMTP settings, SEED_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL

### 5. Created ecosystem.config.js
- PM2 config for standalone Next.js server
- 500M memory limit, auto-restart, log files in ./logs/
- User needs to update `cwd` path for their server

### 6. Created DEPLOY.md
- Complete step-by-step Hostinger VPS deployment guide
- Covers: server setup, Node.js 20+, PM2, Nginx reverse proxy, SSL/Let's Encrypt, firewall, maintenance

## Verification
- `bun run lint` passes with zero errors
- No component or store files were modified
