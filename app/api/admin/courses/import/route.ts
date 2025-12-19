import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { courseOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const adminSession = await verifyAdminFromCookie(request)
    if (!adminSession) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { csvContent } = body

    if (!csvContent) {
      return NextResponse.json({ success: false, message: 'CSV内容不能为空' }, { status: 400 })
    }

    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'CSV文件格式错误' }, { status: 400 })
    }

    const header = lines[0].split(',').map((h: string) => h.trim())
    if (header[0] !== '课程号') {
      return NextResponse.json({ success: false, message: 'CSV格式错误，第一行应包含：课程号' }, { status: 400 })
    }

    const courses: Array<{ courseId: string, courseName?: string }> = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) { continue }

      const parts = line.split(',').map((p: string) => p.trim())
      if (parts.length < 1) {
        errors.push(`第${i + 1}行格式错误`)
        continue
      }

      const [courseId, courseName] = parts
      if (!courseId) {
        errors.push(`第${i + 1}行课程号不能为空`)
        continue
      }

      courses.push({ courseId, courseName })
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: `导入失败：\n${errors.join('\n')}` }, { status: 400 })
    }

    if (courses.length === 0) {
      return NextResponse.json({ success: false, message: '没有有效的课程数据' }, { status: 400 })
    }

    courseOperations.createMany(courses)

    return NextResponse.json({
      success: true,
      message: `成功导入 ${courses.length} 个课程`,
      imported: courses.length,
    })
  }
  catch (error: any) {
    console.error('[API /admin/courses/import POST] Error:', error)
    return NextResponse.json({ success: false, message: 'CSV导入失败' }, { status: 500 })
  }
}
