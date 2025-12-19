import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { userOperations } from '@/lib/db'

/**
 * DELETE /api/admin/users/[studentId]
 * 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    // 验证管理员身份
    const adminSession = await verifyAdminFromCookie(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: '未授权' },
        { status: 401 },
      )
    }

    const { studentId } = await params

    // 检查用户是否存在
    const user = userOperations.getByStudentId.get(studentId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 },
      )
    }

    // 删除用户
    userOperations.delete.run(studentId)

    return NextResponse.json({
      success: true,
      message: '用户删除成功',
    })
  }
  catch (error: any) {
    console.error('[API /admin/users/:studentId DELETE] Error:', error)
    return NextResponse.json(
      { success: false, message: '删除用户失败' },
      { status: 500 },
    )
  }
}
