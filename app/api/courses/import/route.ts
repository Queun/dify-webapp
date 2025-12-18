import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { courseOperations } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvContent } = body

    if (!csvContent) {
      return NextResponse.json(
        { success: false, message: 'CSV内容不能为空' },
        { status: 400 },
      )
    }

    const lines = csvContent.trim().split('\n')

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'CSV文件内容不足（至少需要标题行和一行数据）' },
        { status: 400 },
      )
    }

    const errors: string[] = []
    const courses: Array<{ courseId: string, courseName?: string }> = []

    // Skip header row, start from line 2
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line)
      { continue }

      // 支持逗号和空格（制表符）分隔符
      // 优先检查逗号，如果没有逗号则使用空格/制表符分隔
      let parts: string[]
      if (line.includes(',')) {
        parts = line.split(',').map(p => p.trim())
      } else {
        // 使用空格或制表符分隔，过滤空字符串
        parts = line.split(/\s+/).filter(p => p)
      }

      if (parts.length < 1) {
        errors.push(`第 ${i + 1} 行：格式错误（需要至少1列）`)
        continue
      }

      const courseId = parts[0]
      const courseName = parts[1] || courseId

      if (!courseId) {
        errors.push(`第 ${i + 1} 行：课程号为空`)
        continue
      }

      courses.push({ courseId, courseName })
    }

    if (courses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '没有有效的课程数据',
          errors,
        },
        { status: 400 },
      )
    }

    // Bulk insert courses
    courseOperations.createMany(courses)

    const message = errors.length > 0
      ? `成功导入 ${courses.length} 个课程，${errors.length} 个错误`
      : `成功导入 ${courses.length} 个课程`

    return NextResponse.json({
      success: true,
      message,
      imported: courses.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  }
  catch (error) {
    console.error('Import courses error:', error)
    return NextResponse.json(
      { success: false, message: '导入课程失败' },
      { status: 500 },
    )
  }
}
