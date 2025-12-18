/**
 * 服务器端认证工具函数
 *
 * ⚠️ 此文件只能在服务器端使用（API routes, Server Components）
 * 不要在客户端组件中导入此文件！
 */

import type { NextRequest } from 'next/server'
import type { CurrentUser } from '@/types/auth'
import { sessionOperations } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

/**
 * 从NextRequest获取用户会话信息（服务器端）
 * 用于API路由中验证用户身份
 */
export async function getServerCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('user_session')?.value

    if (!sessionToken) {
      return null
    }

    // Verify token
    const payload = await verifyToken(sessionToken)

    if (!payload || payload.type !== 'user') {
      return null
    }

    // Check session in database
    const session = sessionOperations.getUserSession.get(sessionToken) as any

    if (!session) {
      return null
    }

    // Return user info
    return {
      name: session.name,
      studentId: session.student_id,
      courseId: session.course_id,
      loginAt: session.login_at,
    }
  }
  catch (error) {
    console.error('获取服务器端用户会话失败:', error)
    return null
  }
}
