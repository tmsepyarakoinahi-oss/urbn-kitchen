#!/bin/bash
set -e

echo "🔧 Starting Vercel build process..."

# Step 1: Switch Prisma provider to PostgreSQL if DATABASE_URL is a postgres URL
if echo "$DATABASE_URL" | grep -q '^postgres'; then
  echo "📦 Detected PostgreSQL DATABASE_URL — switching Prisma provider..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  echo "✅ Prisma provider switched to postgresql"
else
  echo "📦 Using SQLite (no PostgreSQL URL detected)"
fi

# Step 2: Generate Prisma Client (no database operations during build!)
echo "🔄 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Step 3: Build the Next.js application
echo "🏗️  Building Next.js application..."
npx next build
echo "✅ Build complete!"
echo ""
echo "⚠️  IMPORTANT: After deployment, visit /api/setup-db to create database tables and seed data!"
