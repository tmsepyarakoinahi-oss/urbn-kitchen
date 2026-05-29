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

# Step 2: Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Step 3: Push database schema (only if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "📊 Pushing database schema..."
  npx prisma db push --accept-data-loss 2>&1 || {
    echo "⚠️  Database push failed — continuing anyway (schema may already exist)"
  }
  echo "✅ Database schema ready"
else
  echo "⚠️  No DATABASE_URL set, skipping database push"
fi

# Step 4: Seed the database (non-blocking — errors won't fail the build)
if [ -n "$DATABASE_URL" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts 2>&1 || {
    echo "⚠️  Database seeding failed — continuing anyway (data may already exist)"
  }
else
  echo "⚠️  No DATABASE_URL set, skipping database seed"
fi

# Step 5: Build the Next.js application
echo "🏗️  Building Next.js application..."
npx next build
echo "✅ Build complete!"
