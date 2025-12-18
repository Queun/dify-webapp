import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

/**
 * GET /api/admin/export-chats
 * 导出聊天记录（JSON格式）
 *
 * 查询参数：
 * - course_id: 可选，按课程筛选
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 验证管理员身份（暂时跳过，后续可添加）
    // const adminSession = await getAdminSessionFromCookie(request)
    // if (!adminSession) {
    //   return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

    // 构建SQL查询
    let query = `
      SELECT
        u.name as student_name,
        ch.student_id,
        ch.course_id,
        ch.conversation_id,
        ch.message_id,
        ch.message_type,
        ch.content,
        ch.metadata,
        ch.created_at
      FROM chat_history ch
      LEFT JOIN users u ON ch.student_id = u.student_id
    `

    const params: string[] = []

    if (courseId) {
      query += ' WHERE ch.course_id = ?'
      params.push(courseId)
    }

    query += ' ORDER BY ch.student_id, ch.conversation_id, ch.created_at ASC'

    // 执行查询
    const stmt = db.prepare(query)
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all()

    // 数据转换和分组
    const studentMap = new Map<string, any>()

    for (const row of rows as any[]) {
      const studentKey = `${row.student_id}_${row.course_id}`

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          studentName: row.student_name || row.student_id,
          studentId: row.student_id,
          courseId: row.course_id,
          conversations: new Map<string, any>(),
        })
      }

      const student = studentMap.get(studentKey)!
      const conversationId = row.conversation_id

      if (!student.conversations.has(conversationId)) {
        student.conversations.set(conversationId, {
          conversationId,
          messages: [],
        })
      }

      const conversation = student.conversations.get(conversationId)!

      conversation.messages.push({
        messageId: row.message_id,
        messageType: row.message_type,
        content: row.content,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        timestamp: row.created_at,
      })
    }

    // 转换为数组格式
    const exportData = Array.from(studentMap.values()).map(student => ({
      ...student,
      conversations: Array.from(student.conversations.values()).map(conv => ({
        conversationId: conv.conversationId,
        startTime: conv.messages[0]?.timestamp,
        endTime: conv.messages[conv.messages.length - 1]?.timestamp,
        messageCount: conv.messages.length,
        messages: conv.messages,
      })),
    }))

    // 计算统计信息
    const totalStudents = exportData.length
    const totalConversations = exportData.reduce((sum, s) => sum + s.conversations.length, 0)
    const totalMessages = exportData.reduce(
      (sum, s) => sum + s.conversations.reduce((cSum, c) => cSum + c.messageCount, 0),
      0,
    )

    // 返回JSON格式
    return NextResponse.json({
      success: true,
      exportTime: new Date().toISOString(),
      courseId: courseId || 'all',
      totalStudents,
      totalConversations,
      totalMessages,
      data: exportData,
    })
  }
  catch (error) {
    console.error('Export chats error:', error)
    return NextResponse.json(
      { success: false, message: '导出失败' },
      { status: 500 },
    )
  }
}
