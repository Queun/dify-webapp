import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { userOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentIds } = body

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供要删除的用户ID列表' },
        { status: 400 },
      )
    }

    let deleted = 0
    const errors: string[] = []

    for (const studentId of studentIds) {
      try {
        userOperations.delete.run(studentId)
        deleted++
      }
      catch (_error) {
        errors.push(`删除用户 ${studentId} 失败`)
      }
    }

    if (deleted === 0) {
      return NextResponse.json(
        { success: false, message: '没有用户被删除', errors },
        { status: 400 },
      )
    }

    const message = errors.length > 0
      ? `成功删除 ${deleted} 个用户，${errors.length} 个失败`
      : `成功删除 ${deleted} 个用户`

    return NextResponse.json({
      success: true,
      message,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    })
  }
  catch (_error) {
    console.error('Batch delete users error:', _error)
    return NextResponse.json(
      { success: false, message: '批量删除用户失败' },
      { status: 500 },
    )
  }
}
