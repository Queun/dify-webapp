import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { userOperations } from '@/lib/db'

/**
 * POST /api/admin/users/batch-delete
 * 批量删除用户
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const adminSession = await verifyAdminFromCookie(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { studentIds } = body

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供要删除的学号列表' },
        { status: 400 },
      )
    }

    // 批量删除
    let deleted = 0
    for (const studentId of studentIds) {
      try {
        userOperations.delete.run(studentId)
        deleted++
      }
      catch (error) {
        console.error(`Failed to delete user ${studentId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${deleted} 个用户`,
      deleted,
    })
  }
  catch (error: any) {
    console.error('[API /admin/users/batch-delete POST] Error:', error)
    return NextResponse.json(
      { success: false, message: '批量删除失败' },
      { status: 500 },
    )
  }
}
