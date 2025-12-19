/**
 * 聊天记录API客户端封装
 */

export async function saveChatMessage(data: {
  conversationId: string
  messageId: string
  messageType: 'question' | 'answer'
  content: string
  metadata?: any
}) {
  try {
    const response = await fetch('/api/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[saveChatMessage] Error:', error)
    return { success: false, message: '保存聊天记录失败' }
  }
}

export async function getChatHistory(conversationId?: string) {
  try {
    const url = conversationId
      ? `/api/chat-history?conversation_id=${conversationId}`
      : '/api/chat-history'

    const response = await fetch(url)
    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[getChatHistory] Error:', error)
    return { success: false, messages: [] }
  }
}
