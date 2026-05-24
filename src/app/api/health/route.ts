import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`

    // Check if tables exist by counting users
    const userCount = await db.user.count()
    const roleCount = await db.role.count()
    const productCount = await db.product.count()

    return NextResponse.json({
      status: true,
      message: 'Database connection OK',
      data: {
        database: 'connected',
        users: userCount,
        roles: roleCount,
        products: productCount,
        seeded: userCount > 0,
        loginCredentials: userCount > 0 ? {
          admin: 'admin@urbankitchens.com / admin123',
          manager: 'priya@urbankitchens.com / manager123',
          employee: 'suresh@urbankitchens.com / employee123',
          customer: 'anand@restaurant.com / customer123',
        } : 'Database not seeded yet. Visit /api/seed?secret=YOUR_SEED_SECRET',
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: false,
      message: 'Database connection FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check your DATABASE_URL environment variable in Vercel Settings → Environment Variables',
    }, { status: 500 })
  }
}
