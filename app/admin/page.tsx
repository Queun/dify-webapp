'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAdmin, adminLogout, getUserList, getCourseList } from '@/service/admin'
import Toast from '@/app/components/base/toast'
import UserManagement from '@/app/components/admin/user-management'
import CourseManagement from '@/app/components/admin/course-management'
import ChatExport from '@/app/components/admin/chat-export'

export default function AdminPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'courses' | 'export'>('dashboard')
  const [isChecking, setIsChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // 检查管理员登录状态
  useEffect(() => {
    const checkAdmin = async () => {
      const { isAdmin } = await verifyAdmin()
      setIsAdmin(isAdmin)
      setIsChecking(false)

      if (!isAdmin) {
        router.push('/admin/login')
      }
    }
    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    const result = await adminLogout()
    if (result.success) {
      Toast.notify({ type: 'success', message: '管理员已退出登录' })
      router.push('/admin/login')
    }
  }

  const handleBackToApp = () => {
    router.push('/')
  }

  // 如果正在检查或不是管理员，显示加载状态
  if (isChecking || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">正在验证管理员权限...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">系统管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToApp}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                返回主应用
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 侧边栏导航 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  概览
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'users'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  用户管理
                </button>
                <button
                  onClick={() => setCurrentView('courses')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'courses'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  课程管理
                </button>
                <button
                  onClick={() => setCurrentView('export')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'export'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  数据导出
                </button>
              </nav>
            </div>

            {/* 主要内容区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {currentView === 'dashboard' && <DashboardView />}
                  {currentView === 'users' && <UserManagement />}
                  {currentView === 'courses' && <CourseManagement />}
                  {currentView === 'export' && <ChatExport />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 概览视图
function DashboardView() {
  const [stats, setStats] = useState({
    userCount: 0,
    courseCount: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      const userList = await getUserList()
      const courseList = await getCourseList()
      setStats({
        userCount: userList.length,
        courseCount: courseList.length,
      })
    }
    loadStats()
  }, [])

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">系统概览</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600">用户总数</div>
          <div className="text-2xl font-bold text-blue-900">{stats.userCount}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600">课程总数</div>
          <div className="text-2xl font-bold text-green-900">{stats.courseCount}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-600">对话记录</div>
          <div className="text-2xl font-bold text-purple-900">功能开发中</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-800 mb-2">系统信息</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            <p>• 用户认证：支持姓名+学号+课程号登录验证</p>
            <p>• 会话隔离：每个用户的对话记录独立存储</p>
            <p>• 数据存储：使用浏览器LocalStorage进行数据持久化</p>
            <p>• 管理功能：支持用户和课程的CRUD操作</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 课程管理视图 - 已移除，由 CourseManagement 组件替代

// 导出视图 - 已移除，由 DataExport 组件替代
