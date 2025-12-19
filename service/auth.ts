/**
 * 用户认证API客户端服务
 */

import type { LoginFormData } from '@/types/auth'

export interface LoginValidationResult {
  success: boolean
  message?: string
}

export interface CurrentUser {
  name: string
  studentId: string
  courseId: string
}

/**
 * 用户登录
 */
export async function userLogin(formData: LoginFormData): Promise<LoginValidationResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /auth/login] Error:', error)
    return {
      success: false,
      message: '网络连接失败，请检查网络后重试',
    }
  }
}

/**
 * 用户登出
 */
export async function userLogout(): Promise<LoginValidationResult> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /auth/logout] Error:', error)
    return {
      success: false,
      message: '登出失败',
    }
  }
}

/**
 * 验证用户登录状态
 */
export async function verifyUser(): Promise<{ isLoggedIn: boolean, user?: CurrentUser }> {
  try {
    const response = await fetch('/api/auth/verify')
    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /auth/verify] Error:', error)
    return { isLoggedIn: false }
  }
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const result = await verifyUser()
  return result.isLoggedIn ? result.user || null : null
}
