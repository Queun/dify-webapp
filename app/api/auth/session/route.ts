import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sessionOperations } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('user_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: '未登录', user: null },
        { status: 401 },
      )
    }

    // Verify token
    const payload = await verifyToken(sessionToken)

    if (!payload || payload.type !== 'user') {
      return NextResponse.json(
        { success: false, message: '无效的会话', user: null },
        { status: 401 },
      )
    }

    // Check session in database
    const session = sessionOperations.getUserSession.get(sessionToken) as any

    if (!session) {
      return NextResponse.json(
        { success: false, message: '会话已过期', user: null },
        { status: 401 },
      )
    }

    // Return user info
    return NextResponse.json({
      success: true,
      user: {
        name: session.name,
        studentId: session.student_id,
        courseId: session.course_id,
        loginAt: session.login_at,
      },
    })
  }
  catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, message: '会话检查失败', user: null },
      { status: 500 },
    )
  }
}
