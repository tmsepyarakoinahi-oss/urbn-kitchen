import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (priority) where.priority = priority

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              department: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Tasks fetched successfully',
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, title, description, priority, dueDate } = body

    if (!employeeId || !title) {
      return NextResponse.json(
        { status: false, message: 'Employee ID and title are required' },
        { status: 400 }
      )
    }

    // Verify employee exists
    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json(
        { status: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    const task = await db.task.create({
      data: {
        employeeId,
        title,
        description: description || null,
        priority: priority || 'medium',
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            department: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Task created successfully',
      data: task,
    }, { status: 201 })
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks - Update task status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, status, title, description, priority, dueDate } = body

    if (!taskId) {
      return NextResponse.json(
        { status: false, message: 'Task ID is required' },
        { status: 400 }
      )
    }

    const existingTask = await db.task.findUnique({ where: { id: taskId } })
    if (!existingTask) {
      return NextResponse.json(
        { status: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (priority) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            department: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Task updated successfully',
      data: task,
    })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update task' },
      { status: 500 }
    )
  }
}
