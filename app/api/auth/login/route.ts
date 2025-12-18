import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { userOperations, courseOperations, sessionOperations } from '@/lib/db'
import { createUserSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, studentId, courseId } = body

    // Validate input
    if (!name || !studentId || !courseId) {
      return NextResponse.json(
        { success: false, message: '请填写完整的登录信息' },
        { status: 400 },
      )
    }

    // Trim inputs
    const trimmedName = name.trim()
    const trimmedStudentId = studentId.trim()
    const trimmedCourseId = courseId.trim()

    // Validate user credentials
    const user = userOperations.findByCredentials.get(trimmedStudentId, trimmedName) as any

    if (!user) {
      return NextResponse.json(
        { success: false, message: '学号或姓名错误' },
        { status: 401 },
      )
    }

    // Validate course exists
    const course = courseOperations.getByCourseId.get(trimmedCourseId) as any

    if (!course) {
      return NextResponse.json(
        { success: false, message: '课程号不存在' },
        { status: 401 },
      )
    }

    // Generate session token
    const { token, expiresAt } = await createUserSessionToken(
      trimmedStudentId,
      trimmedCourseId,
      trimmedName,
    )

    // Store session in database
    sessionOperations.createUserSession.run(
      token,
      trimmedStudentId,
      trimmedCourseId,
      trimmedName,
      expiresAt,
    )

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        name: trimmedName,
        studentId: trimmedStudentId,
        courseId: trimmedCourseId,
      },
    })

    // Set HTTP-only cookie with session token
    response.cookies.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    })

    return response
  }
  catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 },
    )
  }
}
