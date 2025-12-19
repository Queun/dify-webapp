import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'

/**
 * GET /api/admin/verify
 * 验证管理员登录状态
 *
 * 返回: { isAdmin: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const adminSession = await verifyAdminFromCookie(request)

    return NextResponse.json({
      isAdmin: !!adminSession,
    })
  }
  catch (error: any) {
    console.error('[API /admin/verify] Error:', error)
    return NextResponse.json({
      isAdmin: false,
    })
  }
}
