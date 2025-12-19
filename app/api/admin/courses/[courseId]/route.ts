import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { courseOperations } from '@/lib/db'

/**
 * DELETE /api/admin/courses/[courseId]
 * 删除课程
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
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

    const { courseId } = await params

    // 检查课程是否存在
    const course = courseOperations.getByCourseId.get(courseId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: '课程不存在' },
        { status: 404 },
      )
    }

    // 删除课程
    courseOperations.delete.run(courseId)

    return NextResponse.json({
      success: true,
      message: '课程删除成功',
    })
  }
  catch (error: any) {
    console.error('[API /admin/courses/:courseId DELETE] Error:', error)
    return NextResponse.json(
      { success: false, message: '删除课程失败' },
      { status: 500 },
    )
  }
}
