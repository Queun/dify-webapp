/**
 * API路由中间件 - 认证和会话验证（简化版，无JWT）
 */

import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sessionOperations } from './db'

export interface UserSession {
  studentId: string
  courseId: string
  name: string
  token: string
}

export interface AdminSession {
  isAdmin: boolean
  token: string
}

/**
 * 从Cookie中获取并验证用户会话
 */
export async function verifyUserFromCookie(request: NextRequest): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_session_token')?.value

    if (!token) {
      return null
    }

    // 直接检查数据库中的session是否存在且未过期
    const session = sessionOperations.getUserSession.get(token) as any
    if (!session) {
      return null
    }

    // 检查是否过期
    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      // Session已过期，删除
      sessionOperations.deleteUserSession.run(token)
      return null
    }

    return {
      studentId: session.student_id,
      courseId: session.course_id,
      name: session.name,
      token,
    }
  }
  catch (error) {
    console.error('[Middleware] Verify user session error:', error)
    return null
  }
}

/**
 * 从Cookie中获取并验证管理员会话
 */
export async function verifyAdminFromCookie(request: NextRequest): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session_token')?.value

    if (!token) {
      return null
    }

    // 直接检查数据库中的session是否存在且未过期
    const session = sessionOperations.getAdminSession.get(token) as any
    if (!session) {
      return null
    }

    // 检查是否过期
    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      // Session已过期，删除
      sessionOperations.deleteAdminSession.run(token)
      return null
    }

    return {
      isAdmin: true,
      token,
    }
  }
  catch (error) {
    console.error('[Middleware] Verify admin session error:', error)
    return null
  }
}

/**
 * 设置用户session cookie
 */
export async function setUserSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies()

  // 计算maxAge（秒）
  const expiresDate = new Date(expiresAt)
  const now = new Date()
  const maxAge = Math.floor((expiresDate.getTime() - now.getTime()) / 1000)

  cookieStore.set('user_session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
}

/**
 * 设置管理员session cookie
 */
export async function setAdminSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies()

  // 计算maxAge（秒）
  const expiresDate = new Date(expiresAt)
  const now = new Date()
  const maxAge = Math.floor((expiresDate.getTime() - now.getTime()) / 1000)

  cookieStore.set('admin_session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
}

/**
 * 清除用户session cookie
 */
export async function clearUserSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session_token')
}

/**
 * 清除管理员session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session_token')
}
