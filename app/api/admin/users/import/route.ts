import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAdminFromCookie } from '@/lib/middleware'
import { userOperations } from '@/lib/db'

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
    if (header[0] !== '姓名' || header[1] !== '学号') {
      return NextResponse.json({ success: false, message: 'CSV格式错误，第一行应为：姓名,学号' }, { status: 400 })
    }

    const users: Array<{ studentId: string, name: string }> = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) { continue }

      const parts = line.split(',').map((p: string) => p.trim())
      if (parts.length < 2) {
        errors.push(`第${i + 1}行格式错误`)
        continue
      }

      const [name, studentId] = parts
      if (!name || !studentId) {
        errors.push(`第${i + 1}行数据不完整`)
        continue
      }

      users.push({ studentId, name })
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: `导入失败：\n${errors.join('\n')}` }, { status: 400 })
    }

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: '没有有效的用户数据' }, { status: 400 })
    }

    userOperations.createMany(users)

    return NextResponse.json({
      success: true,
      message: `成功导入 ${users.length} 个用户`,
      imported: users.length,
    })
  }
  catch (error: any) {
    console.error('[API /admin/users/import POST] Error:', error)
    return NextResponse.json({ success: false, message: 'CSV导入失败' }, { status: 500 })
  }
}
