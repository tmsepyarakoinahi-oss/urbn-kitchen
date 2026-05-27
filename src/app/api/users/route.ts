import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// GET /api/users - List users with roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (role) {
      where.role = { roleName: role }
    }

    const [users, roles] = await Promise.all([
      db.user.findMany({
        where,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.role.findMany({ orderBy: { roleName: 'asc' } }),
    ])

    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user)

    return NextResponse.json({
      status: true,
      message: 'Users fetched successfully',
      data: { users: usersWithoutPasswords, roles },
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone } = body

    if (!id) {
      return NextResponse.json(
        { status: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { status: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json(
          { status: false, message: 'Email is already in use' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone || null

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      status: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
