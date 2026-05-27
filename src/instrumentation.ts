export async function register() {
  // Auto-seed database if empty (development only)
  if (process.env.NODE_ENV === 'development') {
    try {
      const { db } = await import('@/lib/db')
      const userCount = await db.user.count()
      if (userCount === 0) {
        console.log('[Auto-Seed] Database is empty, seeding...')
        const res = await fetch(`http://localhost:3000/api/seed`, { method: 'POST' })
        const data = await res.json()
        if (data.status) {
          console.log('[Auto-Seed] ✅ Database seeded successfully!')
        } else {
          console.error('[Auto-Seed] ❌ Seeding failed:', data.message)
        }
      } else {
        console.log(`[Auto-Seed] Database already has ${userCount} users, skipping seed.`)
      }
    } catch (error) {
      console.error('[Auto-Seed] Error:', error)
    }
  }
}
