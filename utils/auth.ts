/**
 * 认证工具函数
 *
 * 功能：
 * - 用户登录验证
 * - 当前用户管理
 * - 用户/课程列表管理
 */

import type {
  Course,
  CurrentUser,
  LoginFormData,
  LoginValidationResult,
  User,
} from '@/types/auth'
import { STORAGE_KEYS } from '@/types/auth'

/**
 * 检查是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * 初始化系统数据（首次使用时）
 */
export function initializeSystemData() {
  if (!isBrowser()) { return }

  // 初始化管理员密码
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, '5635')
  }

  // 初始化用户列表（如果为空）
  if (!localStorage.getItem(STORAGE_KEYS.USER_LIST)) {
    const defaultUsers: User[] = [
      {
        name: '测试学生',
        studentId: '2024001',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.USER_LIST, JSON.stringify(defaultUsers))
  }

  // 初始化课程列表（如果为空）
  if (!localStorage.getItem(STORAGE_KEYS.COURSE_LIST)) {
    const defaultCourses: Course[] = [
      {
        courseId: 'CS101',
        courseName: '计算机科学导论',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.COURSE_LIST, JSON.stringify(defaultCourses))
  }
}

/**
 * 获取用户列表
 */
export function getUserList(): User[] {
  if (!isBrowser()) { return [] }
  const data = localStorage.getItem(STORAGE_KEYS.USER_LIST)
  return data ? JSON.parse(data) : []
}

/**
 * 获取课程列表
 */
export function getCourseList(): Course[] {
  if (!isBrowser()) { return [] }
  const data = localStorage.getItem(STORAGE_KEYS.COURSE_LIST)
  return data ? JSON.parse(data) : []
}

/**
 * 验证用户登录
 *
 * 规则：
 * 1. 学号+姓名必须在用户列表中匹配
 * 2. 课程号必须在课程白名单中
 */
export function validateLogin(formData: LoginFormData): LoginValidationResult {
  if (!isBrowser()) {
    return {
      success: false,
      message: '浏览器环境不可用',
    }
  }

  const { name, studentId, courseId } = formData

  // 验证必填字段
  if (!name || !studentId || !courseId) {
    return {
      success: false,
      message: '请填写所有必填字段',
    }
  }

  // 验证学号+姓名是否匹配
  const userList = getUserList()
  const user = userList.find(
    u => u.studentId === studentId && u.name === name,
  )

  if (!user) {
    return {
      success: false,
      message: '学号和姓名不匹配，请检查后重试',
    }
  }

  // 验证课程号是否合法
  const courseList = getCourseList()
  const course = courseList.find(c => c.courseId === courseId)

  if (!course) {
    return {
      success: false,
      message: '课程号不存在，请联系管理员',
    }
  }

  return {
    success: true,
  }
}

/**
 * 用户登录
 */
export function login(formData: LoginFormData): LoginValidationResult {
  if (!isBrowser()) {
    return {
      success: false,
      message: '浏览器环境不可用',
    }
  }

  const validation = validateLogin(formData)

  if (!validation.success) {
    return validation
  }

  // 保存当前登录用户
  const currentUser: CurrentUser = {
    name: formData.name,
    studentId: formData.studentId,
    courseId: formData.courseId,
    loginAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser))

  return {
    success: true,
  }
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser(): CurrentUser | null {
  if (!isBrowser()) { return null }
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  if (!isBrowser()) { return false }
  return getCurrentUser() !== null
}

/**
 * 用户登出
 */
export function logout(): void {
  if (!isBrowser()) { return }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

/**
 * 获取当前用户的聊天记录存储键
 */
export function getChatStorageKey(): string | null {
  const user = getCurrentUser()
  if (!user) { return null }

  return `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${user.studentId}_${user.courseId}`
}

/**
 * 验证管理员密码
 */
export function validateAdminPassword(password: string): boolean {
  if (!isBrowser()) { return false }
  const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)
  return password === storedPassword
}
