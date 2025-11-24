/**
 * 认证系统类型定义
 */

/**
 * 用户信息
 */
export interface User {
  name: string // 姓名
  studentId: string // 学号
  createdAt: string // 创建时间
}

/**
 * 课程信息
 */
export interface Course {
  courseId: string // 课程号
  courseName: string // 课程名称（可选）
  createdAt: string // 创建时间
}

/**
 * 当前登录用户信息
 */
export interface CurrentUser {
  name: string // 姓名
  studentId: string // 学号
  courseId: string // 课程号
  loginAt: string // 登录时间
}

/**
 * 登录表单数据
 */
export interface LoginFormData {
  name: string
  studentId: string
  courseId: string
}

/**
 * 登录验证结果
 */
export interface LoginValidationResult {
  success: boolean
  message?: string
}

/**
 * LocalStorage 键名常量
 */
export const STORAGE_KEYS = {
  USER_LIST: 'dify_user_list', // 学生名单
  COURSE_LIST: 'dify_course_list', // 课程号白名单
  CURRENT_USER: 'dify_current_user', // 当前登录用户
  ADMIN_PASSWORD: 'dify_admin_password', // 管理员密码
  CHAT_HISTORY_PREFIX: 'dify_chat_', // 聊天记录前缀: dify_chat_${studentId}_${courseId}
} as const
