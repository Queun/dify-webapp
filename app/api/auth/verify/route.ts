import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyUserFromCookie } from '@/lib/middleware'

/**
 * GET /api/auth/verify
 * 验证用户登录状态
 *
 * 返回: { isLoggedIn: boolean, user?: { name, studentId, courseId } }
 */
export async function GET(request: NextRequest) {
  try {
    const userSession = await verifyUserFromCookie(request)

    if (!userSession) {
      return NextResponse.json({
        isLoggedIn: false,
      })
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        name: userSession.name,
        studentId: userSession.studentId,
        courseId: userSession.courseId,
      },
    })
  }
  catch (error: any) {
    console.error('[API /auth/verify] Error:', error)
    return NextResponse.json({
      isLoggedIn: false,
    })
  }
}
