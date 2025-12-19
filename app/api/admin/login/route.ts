import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { configOperations, sessionOperations } from '@/lib/db'
import { createAdminSessionToken } from '@/lib/auth'
import { setAdminSessionCookie } from '@/lib/middleware'

/**
 * POST /api/admin/login
 * 管理员登录
 *
 * Body: { password: string }
 * 返回: { success: boolean, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // 验证必填字段
    if (!password) {
      return NextResponse.json({
        success: false,
        message: '请输入管理员密码',
      }, { status: 400 })
    }

    // 验证密码
    const storedPassword = configOperations.getAdminPassword.get() as any
    if (!storedPassword || password !== storedPassword.value) {
      return NextResponse.json({
        success: false,
        message: '密码错误',
      }, { status: 401 })
    }

    // 生成JWT token
    const { token, expiresAt } = await createAdminSessionToken()

    // 保存session到数据库
    sessionOperations.createAdminSession.run(token, expiresAt)

    // 设置cookie
    await setAdminSessionCookie(token, expiresAt)

    return NextResponse.json({
      success: true,
    })
  }
  catch (error: any) {
    console.error('[API /admin/login] Error:', error)
    return NextResponse.json({
      success: false,
      message: '登录过程中出现错误',
    }, { status: 500 })
  }
}
