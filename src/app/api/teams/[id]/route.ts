import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/teams/[id] - Fetch single team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.team.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Team fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[id] - Update team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, leadId, members, department, status } = body

    const existing = await db.team.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    const result = await db.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(leadId !== undefined && { leadId }),
        ...(members !== undefined && { members: parseInt(members) }),
        ...(department !== undefined && { department }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Team update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update team' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.team.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    await db.team.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Team delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
