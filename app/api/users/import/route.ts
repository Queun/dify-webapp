import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { userOperations } from '@/lib/db'

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
    const users: Array<{ studentId: string, name: string }> = []

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

      if (parts.length < 2) {
        errors.push(`第 ${i + 1} 行：格式错误（需要至少2列）`)
        continue
      }

      // CSV格式：学号,姓名（或 学号 姓名）
      const [studentId, name] = parts

      if (!studentId || !name) {
        errors.push(`第 ${i + 1} 行：学号或姓名为空`)
        continue
      }

      users.push({ studentId, name })
    }

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '没有有效的用户数据',
          errors,
        },
        { status: 400 },
      )
    }

    // Bulk insert users
    userOperations.createMany(users)

    const message = errors.length > 0
      ? `成功导入 ${users.length} 个用户，${errors.length} 个错误`
      : `成功导入 ${users.length} 个用户`

    return NextResponse.json({
      success: true,
      message,
      imported: users.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  }
  catch (error) {
    console.error('Import users error:', error)
    return NextResponse.json(
      { success: false, message: '导入用户失败' },
      { status: 500 },
    )
  }
}
