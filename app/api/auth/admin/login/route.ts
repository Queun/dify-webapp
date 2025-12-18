import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { configOperations, sessionOperations } from '@/lib/db'
import { createAdminSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, message: '请输入密码' },
        { status: 400 },
      )
    }

    // Get admin password from database
    const config = configOperations.getAdminPassword.get() as any

    if (!config || config.value !== password) {
      return NextResponse.json(
        { success: false, message: '密码错误' },
        { status: 401 },
      )
    }

    // Generate admin session token
    const { token, expiresAt } = await createAdminSessionToken()

    // Store session in database
    sessionOperations.createAdminSession.run(token, expiresAt)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: '管理员登录成功',
      isAdmin: true,
    })

    // Set HTTP-only cookie with admin session token
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60, // 12 hours in seconds
      path: '/',
    })

    return response
  }
  catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 },
    )
  }
}
