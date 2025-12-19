import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { userOperations } from '@/lib/db'

/**
 * GET /api/admin/users
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const adminSession = await verifyAdminFromCookie(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 },
      )
    }

    // 获取所有用户
    const rawUsers = userOperations.getAll.all() as any[]

    // 转换字段名为camelCase
    const users = rawUsers.map(user => ({
      studentId: user.student_id,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }))

    return NextResponse.json({
      success: true,
      users,
    })
  }
  catch (error: any) {
    console.error('[API /admin/users GET] Error:', error)
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/users
 * 添加用户
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const adminSession = await verifyAdminFromCookie(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { name, studentId } = body

    // 验证必填字段
    if (!name || !studentId) {
      return NextResponse.json(
        { success: false, message: '姓名和学号不能为空' },
        { status: 400 },
      )
    }

    // 检查学号是否已存在
    const existingUser = userOperations.getByStudentId.get(studentId)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '该学号已存在' },
        { status: 400 },
      )
    }

    // 创建用户
    userOperations.create.run(studentId, name)

    return NextResponse.json({
      success: true,
      message: '用户添加成功',
    })
  }
  catch (error: any) {
    console.error('[API /admin/users POST] Error:', error)
    return NextResponse.json(
      { success: false, message: '添加用户失败' },
      { status: 500 },
    )
  }
}
