import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { userOperations, courseOperations, sessionOperations } from '@/lib/db'
import { createUserSessionToken } from '@/lib/auth'
import { setUserSessionCookie } from '@/lib/middleware'

/**
 * POST /api/auth/login
 * 用户登录
 *
 * Body: { name: string, studentId: string, courseId: string }
 * 返回: { success: boolean, message?: string, user?: { name, studentId, courseId } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, studentId, courseId } = body

    // 验证必填字段
    if (!name || !studentId || !courseId) {
      return NextResponse.json({
        success: false,
        message: '请填写所有必填字段',
      }, { status: 400 })
    }

    // 验证用户是否存在（学号+姓名匹配）
    const user = userOperations.findByCredentials.get(studentId, name) as any
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '学号和姓名不匹配，请检查后重试',
      }, { status: 401 })
    }

    // 验证课程是否存在
    const course = courseOperations.getByCourseId.get(courseId) as any
    if (!course) {
      return NextResponse.json({
        success: false,
        message: '课程号不存在，请联系管理员',
      }, { status: 401 })
    }

    // 生成JWT token
    const { token, expiresAt } = await createUserSessionToken(studentId, courseId, name)

    // 保存session到数据库
    sessionOperations.createUserSession.run(
      token,
      studentId,
      courseId,
      name,
      expiresAt,
    )

    // 设置cookie
    await setUserSessionCookie(token, expiresAt)

    return NextResponse.json({
      success: true,
      user: {
        name,
        studentId,
        courseId,
      },
    })
  }
  catch (error: any) {
    console.error('[API /auth/login] Error:', error)
    return NextResponse.json({
      success: false,
      message: '登录过程中出现错误',
    }, { status: 500 })
  }
}
