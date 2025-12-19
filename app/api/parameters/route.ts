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

    const dataPromise = client.getApplicationParameters(user)

    const { data } = await Promise.race([dataPromise, timeoutPromise])
    return NextResponse.json(data as object, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    console.error('[API /parameters] Error:', error?.message)
    // 返回默认参数,让应用继续加载
    return NextResponse.json({
      opening_statement: '',
      suggested_questions: [],
      suggested_questions_after_answer: { enabled: false },
      speech_to_text: { enabled: false },
      retriever_resource: { enabled: false },
      annotation_reply: { enabled: false },
      user_input_form: [],
      file_upload: { image: { enabled: false, number_limits: 3, transfer_methods: ['local_file', 'remote_url'] } },
      system_parameters: {},
    }, {
      headers: setSession(sessionId),
    })
  }
}
