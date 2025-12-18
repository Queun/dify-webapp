import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sessionOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get admin session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value

    if (sessionToken) {
      // Delete session from database
      sessionOperations.deleteAdminSession.run(sessionToken)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: '已成功退出管理员登录',
    })

    // Clear admin session cookie
    response.cookies.delete('admin_session')

    return response
  }
  catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { success: false, message: '退出登录失败' },
      { status: 500 },
    )
  }
}
