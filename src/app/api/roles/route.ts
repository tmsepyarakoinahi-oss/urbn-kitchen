import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/roles - List all roles
export async function GET() {
  try {
    const roles = await db.role.findMany({
      orderBy: { roleName: 'asc' },
      include: { _count: { select: { users: true } } },
    })
    return NextResponse.json({
      status: true,
      message: 'Roles fetched successfully',
      data: { roles },
    })
  } catch (error) {
    console.error('Roles fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// PUT /api/roles - Update role permissions
export async function PUT(request: NextRequest) {
  try {
    const { id, permissions } = await request.json()
    if (!id) {
      return NextResponse.json(
        { status: false, message: 'Role ID is required' },
        { status: 400 }
      )
    }
    const role = await db.role.update({
      where: { id },
      data: { permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions) },
    })
    return NextResponse.json({
      status: true,
      message: 'Role updated successfully',
      data: role,
    })
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update role' },
      { status: 500 }
    )
  }
}
