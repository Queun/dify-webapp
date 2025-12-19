import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie, clearAdminSessionCookie } from '@/lib/middleware'
import { sessionOperations } from '@/lib/db'

/**
 * POST /api/admin/logout
 * 管理员登出
 *
 * 返回: { success: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const adminSession = await verifyAdminFromCookie(request)

    if (adminSession) {
      // 删除数据库中的session
      sessionOperations.deleteAdminSession.run(adminSession.token)
    }

    // 清除cookie
    await clearAdminSessionCookie()

    return NextResponse.json({
      success: true,
    })
  }
  catch (error: any) {
    console.error('[API /admin/logout] Error:', error)
    return NextResponse.json({
      success: false,
    }, { status: 500 })
  }
}
