export async function register() {
  // Auto-seed database if empty (development only)
  // Run seeding asynchronously to avoid blocking server startup
  if (process.env.NODE_ENV === 'development') {
    // Use setTimeout to avoid blocking the server startup
    setTimeout(async () => {
      try {
        const { db } = await import('@/lib/db')
        const userCount = await db.user.count()
        if (userCount === 0) {
          console.log('[Auto-Seed] Database is empty, seeding...')
          // Retry with backoff since the server might not be fully ready yet
          let seeded = false
          for (let attempt = 1; attempt <= 5; attempt++) {
            try {
              const res = await fetch(`http://localhost:3000/api/seed`, { method: 'POST' })
              const data = await res.json()
              if (data.status) {
                console.log('[Auto-Seed] ✅ Database seeded successfully!')
                seeded = true
                break
              } else {
                console.error(`[Auto-Seed] ❌ Attempt ${attempt} failed:`, data.message)
              }
            } catch (fetchErr) {
              console.log(`[Auto-Seed] Attempt ${attempt}: Server not ready, retrying in ${attempt * 2}s...`)
              await new Promise(r => setTimeout(r, attempt * 2000))
            }
          }
          if (!seeded) {
            console.error('[Auto-Seed] ❌ Failed to seed after all attempts')
          }
        } else {
          console.log(`[Auto-Seed] Database already has ${userCount} users, skipping seed.`)
        }
      } catch (error) {
        console.error('[Auto-Seed] Error:', error)
      }
    }, 3000)
  }
}
