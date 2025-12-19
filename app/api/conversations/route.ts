import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  try {
    // 添加超时控制：10秒超时
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 10000),
    )

    const dataPromise = client.getConversations(user)

    const { data }: any = await Promise.race([dataPromise, timeoutPromise])
    return NextResponse.json(data, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    console.error('[API /conversations] Error:', error.message)
    // 返回空数据而不是错误,让应用继续加载
    return NextResponse.json({
      data: [],
      has_more: false,
      limit: 100,
    }, {
      headers: setSession(sessionId),
    })
  }
}
