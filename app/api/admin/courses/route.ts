import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { courseOperations } from '@/lib/db'

/**
 * GET /api/admin/courses
 * 获取课程列表
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

    // 获取所有课程
    const courses = courseOperations.getAll.all()

    return NextResponse.json({
      success: true,
      courses,
    })
  }
  catch (error: any) {
    console.error('[API /admin/courses GET] Error:', error)
    return NextResponse.json(
      { success: false, message: '获取课程列表失败' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/courses
 * 添加课程
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
    const { courseId, courseName } = body

    // 验证必填字段
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: '课程号不能为空' },
        { status: 400 },
      )
    }

    // 检查课程号是否已存在
    const existingCourse = courseOperations.getByCourseId.get(courseId)
    if (existingCourse) {
      return NextResponse.json(
        { success: false, message: '该课程号已存在' },
        { status: 400 },
      )
    }

    // 创建课程
    courseOperations.create.run(courseId, courseName || courseId)

    return NextResponse.json({
      success: true,
      message: '课程添加成功',
    })
  }
  catch (error: any) {
    console.error('[API /admin/courses POST] Error:', error)
    return NextResponse.json(
      { success: false, message: '添加课程失败' },
      { status: 500 },
    )
  }
}
