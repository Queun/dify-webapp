/**
 * 服务器端认证工具函数
 *
 * ⚠️ 此文件只能在服务器端使用（API routes, Server Components）
 * 不要在客户端组件中导入此文件！
 */

import type { NextRequest } from 'next/server'
import type { CurrentUser } from '@/types/auth'
import { sessionOperations } from '@/lib/db'

/**
 * 从NextRequest获取用户会话信息（服务器端）
 * 用于API路由中验证用户身份
 */
export async function getServerCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  try {
    // Get session token from cookie (注意：cookie名称是 user_session_token)
    const sessionToken = request.cookies.get('user_session_token')?.value

    if (!sessionToken) {
      return null
    }

    // Check session in database (不需要 verifyToken，因为我们已经移除了JWT)
    const session = sessionOperations.getUserSession.get(sessionToken) as any

    if (!session) {
      return null
    }

    // Check if session expired
    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      // Session expired, delete it
      sessionOperations.deleteUserSession.run(sessionToken)
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
