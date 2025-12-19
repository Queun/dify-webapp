import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { chatOperations } from '@/lib/db'
import { getServerCurrentUser } from '@/utils/auth-server'

/**
 * POST /api/chat-history
 * 保存单条聊天记录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const currentUser = await getServerCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const {
      conversationId,
      messageId,
      messageType,
      content,
      metadata,
    } = body

    // 验证必填字段
    if (!conversationId || !messageType || !content) {
      return NextResponse.json(
        { success: false, message: '缺少必填字段' },
        { status: 400 },
      )
    }

    // 验证 messageType
    if (!['question', 'answer'].includes(messageType)) {
      return NextResponse.json(
        { success: false, message: 'messageType 必须是 question 或 answer' },
        { status: 400 },
      )
    }

    // 保存到数据库
    chatOperations.create.run(
      currentUser.studentId,
      currentUser.courseId,
      conversationId,
      messageId || null,
      messageType,
      content,
      metadata ? JSON.stringify(metadata) : null,
    )

    return NextResponse.json({
      success: true,
      message: '聊天记录保存成功',
    })
  }
  catch (error) {
    console.error('保存聊天记录失败:', error)
    return NextResponse.json(
      { success: false, message: '保存聊天记录失败' },
      { status: 500 },
    )
  }
}

/**
 * GET /api/chat-history
 * 获取当前用户的聊天记录
 * 支持按conversation_id筛选: GET /api/chat-history?conversation_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const currentUser = await getServerCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '未登录', messages: [] },
        { status: 401 },
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    // 从数据库获取聊天记录
    let chatHistory: any[]

    if (conversationId) {
      // 按对话ID筛选
      chatHistory = chatOperations.getByConversation.all(
        currentUser.studentId,
        currentUser.courseId,
        conversationId,
      ) as any[]
    }
    else {
      // 获取所有聊天记录
      chatHistory = chatOperations.getByUser.all(
        currentUser.studentId,
        currentUser.courseId,
      ) as any[]
    }

    // 转换数据格式
    const formattedHistory = chatHistory.map(record => ({
      id: record.id,
      studentId: record.student_id,
      courseId: record.course_id,
      conversationId: record.conversation_id,
      messageId: record.message_id,
      messageType: record.message_type,
      content: record.content,
      metadata: record.metadata ? JSON.parse(record.metadata) : null,
      createdAt: record.created_at,
    }))

    return NextResponse.json({
      success: true,
      messages: formattedHistory,
      count: formattedHistory.length,
    })
  }
  catch (error) {
    console.error('获取聊天记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取聊天记录失败', messages: [] },
      { status: 500 },
    )
  }
}
