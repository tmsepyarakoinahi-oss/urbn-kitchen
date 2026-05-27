import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// PUT /api/users/[id] - Update user (change password)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password, name, email, phone, roleId, status } = body

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { status: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (password) {
      updateData.password = await hashPassword(password)
    }
    if (name) updateData.name = name
    if (email) {
      // Check email uniqueness
      if (email !== existingUser.email) {
        const emailTaken = await db.user.findUnique({ where: { email } })
        if (emailTaken) {
          return NextResponse.json(
            { status: false, message: 'Email is already in use' },
            { status: 409 }
          )
        }
      }
      updateData.email = email
    }
    if (phone !== undefined) updateData.phone = phone || null
    if (roleId) updateData.roleId = roleId
    if (status) updateData.status = status

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      status: true,
      message: password ? 'Password updated successfully' : 'User updated successfully',
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update user' },
      { status: 500 }
    )
  }
}
