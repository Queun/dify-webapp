import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { courseOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseIds } = body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供要删除的课程ID列表' },
        { status: 400 },
      )
    }

    let deleted = 0
    const errors: string[] = []

    for (const courseId of courseIds) {
      try {
        courseOperations.delete.run(courseId)
        deleted++
      }
      catch (_error) {
        errors.push(`删除课程 ${courseId} 失败`)
      }
    }

    if (deleted === 0) {
      return NextResponse.json(
        { success: false, message: '没有课程被删除', errors },
        { status: 400 },
      )
    }

    const message = errors.length > 0
      ? `成功删除 ${deleted} 个课程，${errors.length} 个失败`
      : `成功删除 ${deleted} 个课程`

    return NextResponse.json({
      success: true,
      message,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    })
  }
  catch (_error) {
    console.error('Batch delete courses error:', _error)
    return NextResponse.json(
      { success: false, message: '批量删除课程失败' },
      { status: 500 },
    )
  }
}
