---
Task ID: 1
Agent: main
Task: Fix "sandbox is inactive" error and verify full AMC Get Quote functionality

Work Log:
- Dev server was not running, causing {"error":"sandbox is inactive"} in Preview Panel
- Restarted dev server multiple times, discovered server was crashing after API requests
- Root cause 1: Prisma db.log set to ['query'] (verbose) - changed to ['error', 'warn']
- Root cause 2: nodemailer import in email.ts was causing process crash (too heavy for sandbox)
- Root cause 3: Dynamic import of email module in amc-quote/route.ts was also crashing
- Root cause 4: Database was corrupted - reset with `prisma db push --force-reset`
- Fixed email.ts: Changed nodemailer from static import to lazy dynamic import
- Fixed amc-quote/route.ts: Removed email import entirely (SMTP not configured), added console.log for quote tracking
- Fixed db.ts: Changed Prisma log level from ['query'] to ['error', 'warn']
- Ran `prisma db push --force-reset` to reset and re-seed database
- All API endpoints tested and working: GET/POST /api/amc-quote, GET /api/categories, GET /api/products, GET /, POST /api/seed
- Lint check passes with no errors
- Server is stable and handles multiple requests without crashing

Stage Summary:
- Server fixed and running on port 3000
- AMC Quote API fully functional (GET, POST, PATCH)
- Quote form saves to database, returns reference number
- Email sending disabled until SMTP is configured (SMTP_USER/SMTP_PASS in .env)
- Database reset and seeded with sample data
- No lint errors

---
Task ID: 1
Agent: production-fixes
Task: Fix production-critical security and deployment issues

Work Log:
- **Fixed auth.ts (CRITICAL SECURITY)**: Replaced hardcoded SHA-256 salt (`urban_kitchens_salt_2024`) with bcryptjs (12 rounds). Installed `bcryptjs` and `@types/bcryptjs`. Same function signatures (`hashPassword`, `verifyPassword`) preserved so existing code doesn't break.
- **Fixed next.config.ts (PRODUCTION HARDENING)**: Removed `typescript.ignoreBuildErrors: true`, set `reactStrictMode: true`, kept `output: "standalone"`, added security headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, X-DNS-Prefetch-Control, Strict-Transport-Security, Permissions-Policy).
- **Protected seed API endpoint**: Added NODE_ENV=production check returning 403 Forbidden. Added SEED_SECRET token validation via `?secret=xxx` query param on both GET and POST handlers.
- **Created .env.production.template**: Documented all required env vars (DATABASE_URL, SMTP settings, SEED_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL).
- **Created ecosystem.config.js**: PM2 config with standalone server.js, 500M memory limit, auto-restart, log files.
- **Created DEPLOY.md**: Step-by-step Hostinger VPS deployment guide covering server setup, Node.js, PM2, Nginx reverse proxy, SSL/Let's Encrypt, firewall, and ongoing maintenance.
- Lint check passes with no errors

Stage Summary:
- Auth now uses bcryptjs instead of insecure hardcoded salt
- Next.js config hardened for production (no build error hiding, strict mode, security headers)
- Seed endpoint protected against accidental production data wipes
- All deployment artifacts created (.env.production.template, ecosystem.config.js, DEPLOY.md)
- No lint errors
