/**
 * 管理员API客户端服务
 */

import type { User, Course } from '@/types/auth'

export interface ApiResult {
  success: boolean
  message?: string
}

// ===== 认证相关 =====

/**
 * 管理员登录
 */
export async function adminLogin(password: string): Promise<ApiResult> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/login] Error:', error)
    return {
      success: false,
      message: '网络连接失败',
    }
  }
}

/**
 * 管理员登出
 */
export async function adminLogout(): Promise<ApiResult> {
  try {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/logout] Error:', error)
    return {
      success: false,
      message: '登出失败',
    }
  }
}

/**
 * 验证管理员登录状态
 */
export async function verifyAdmin(): Promise<{ isAdmin: boolean }> {
  try {
    const response = await fetch('/api/admin/verify')
    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/verify] Error:', error)
    return { isAdmin: false }
  }
}

// ===== 用户管理相关 =====

/**
 * 获取用户列表
 */
export async function getUserList(): Promise<User[]> {
  try {
    const response = await fetch('/api/admin/users')
    const result = await response.json()
    return result.success ? result.users : []
  }
  catch (error) {
    console.error('[Service /admin/users] Error:', error)
    return []
  }
}

/**
 * 添加用户
 */
export async function addUser(user: Omit<User, 'createdAt'>): Promise<ApiResult> {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/users] Error:', error)
    return {
      success: false,
      message: '添加用户失败',
    }
  }
}

/**
 * 删除用户
 */
export async function deleteUser(studentId: string): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/admin/users/${studentId}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/users/:id] Error:', error)
    return {
      success: false,
      message: '删除用户失败',
    }
  }
}

/**
 * 批量删除用户
 */
export async function batchDeleteUsers(studentIds: string[]): Promise<ApiResult & { deleted?: number }> {
  try {
    const response = await fetch('/api/admin/users/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds }),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/users/batch-delete] Error:', error)
    return {
      success: false,
      message: '批量删除用户失败',
    }
  }
}

/**
 * 批量导入用户（CSV）
 */
export async function importUsers(csvContent: string): Promise<ApiResult & { imported?: number }> {
  try {
    const response = await fetch('/api/admin/users/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent }),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/users/import] Error:', error)
    return {
      success: false,
      message: 'CSV导入失败',
    }
  }
}

// ===== 课程管理相关 =====

/**
 * 获取课程列表
 */
export async function getCourseList(): Promise<Course[]> {
  try {
    const response = await fetch('/api/admin/courses')
    const result = await response.json()
    return result.success ? result.courses : []
  }
  catch (error) {
    console.error('[Service /admin/courses] Error:', error)
    return []
  }
}

/**
 * 添加课程
 */
export async function addCourse(course: Omit<Course, 'createdAt'>): Promise<ApiResult> {
  try {
    const response = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/courses] Error:', error)
    return {
      success: false,
      message: '添加课程失败',
    }
  }
}

/**
 * 删除课程
 */
export async function deleteCourse(courseId: string): Promise<ApiResult> {
  try {
    const response = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/courses/:id] Error:', error)
    return {
      success: false,
      message: '删除课程失败',
    }
  }
}

/**
 * 批量导入课程（CSV）
 */
export async function importCourses(csvContent: string): Promise<ApiResult & { imported?: number }> {
  try {
    const response = await fetch('/api/admin/courses/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent }),
    })

    const result = await response.json()
    return result
  }
  catch (error) {
    console.error('[Service /admin/courses/import] Error:', error)
    return {
      success: false,
      message: 'CSV导入失败',
    }
  }
}
