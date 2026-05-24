import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings - Get all settings as key-value pairs
export async function GET() {
  try {
    const settings = await db.setting.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }
    return NextResponse.json({ status: true, data: settingsMap })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ status: false, message: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/settings - Update settings (upsert)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const upserts = Object.entries(body).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await Promise.all(upserts)

    const settings = await db.setting.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    return NextResponse.json({ status: true, message: 'Settings saved successfully', data: settingsMap })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ status: false, message: 'Failed to save settings' }, { status: 500 })
  }
}
