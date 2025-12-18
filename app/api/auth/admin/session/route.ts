import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sessionOperations } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get admin session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: '未登录', isAdmin: false },
        { status: 401 },
      )
    }

    // Verify token
    const payload = await verifyToken(sessionToken)

    if (!payload || payload.type !== 'admin') {
      return NextResponse.json(
        { success: false, message: '无效的会话', isAdmin: false },
        { status: 401 },
      )
    }

    // Check session in database
    const session = sessionOperations.getAdminSession.get(sessionToken) as any

    if (!session) {
      return NextResponse.json(
        { success: false, message: '会话已过期', isAdmin: false },
        { status: 401 },
      )
    }

    // Return admin status
    return NextResponse.json({
      success: true,
      isAdmin: true,
      loginAt: session.login_at,
    })
  }
  catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json(
      { success: false, message: '会话检查失败', isAdmin: false },
      { status: 500 },
    )
  }
}
