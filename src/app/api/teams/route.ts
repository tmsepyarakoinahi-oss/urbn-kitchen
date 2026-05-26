import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/teams - List teams with department filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')

    const where: Record<string, unknown> = {}
    if (department) where.department = department

    const result = await db.team.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Teams fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

// POST /api/teams - Create team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, leadId, members, department, status } = body

    if (!name) {
      return Response.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await db.team.create({
      data: {
        name,
        leadId: leadId || null,
        members: members ? parseInt(members) : 0,
        department: department || null,
        status: status || 'active',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Team create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create team' },
      { status: 500 }
    )
  }
}
