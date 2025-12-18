import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { userOperations } from '@/lib/db'

// GET all users
export async function GET() {
  try {
    const users = userOperations.getAll.all()

    return NextResponse.json({
      success: true,
      users,
    })
  }
  catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' },
      { status: 500 },
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, studentId } = body

    // Validate input
    if (!name || !studentId) {
      return NextResponse.json(
        { success: false, message: '姓名和学号不能为空' },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existing = userOperations.getByStudentId.get(studentId)

    if (existing) {
      return NextResponse.json(
        { success: false, message: '该学号已存在' },
        { status: 409 },
      )
    }

    // Create user
    userOperations.create.run(studentId, name)

    return NextResponse.json({
      success: true,
      message: '添加用户成功',
    })
  }
  catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, message: '添加用户失败' },
      { status: 500 },
    )
  }
}

// DELETE all users (admin only - for testing/reset)
export async function DELETE() {
  try {
    // This would delete all users - implement only if needed
    return NextResponse.json(
      { success: false, message: '批量删除功能未实现' },
      { status: 501 },
    )
  }
  catch (error) {
    console.error('Delete all users error:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 },
    )
  }
}
