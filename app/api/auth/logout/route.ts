import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sessionOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('user_session')?.value

    if (sessionToken) {
      // Delete session from database
      sessionOperations.deleteUserSession.run(sessionToken)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: '已成功退出登录',
    })

    // Clear session cookie
    response.cookies.delete('user_session')

    return response
  }
  catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: '退出登录失败' },
      { status: 500 },
    )
  }
}
