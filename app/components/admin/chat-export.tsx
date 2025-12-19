'use client'

import React, { useState, useEffect } from 'react'
import type { Course } from '@/types/auth'
import { getCourseList } from '@/service/admin'
import Toast from '@/app/components/base/toast'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

export default function ChatExport() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<{
    totalStudents: number
    totalConversations: number
    totalMessages: number
  } | null>(null)

  // 加载课程列表
  useEffect(() => {
    const loadCourses = async () => {
      const courseList = await getCourseList()
      setCourses(courseList)
    }
    loadCourses()
  }, [])

  // 获取统计信息（预览）
  const fetchStats = async (courseId: string) => {
    try {
      const url = courseId === 'all'
        ? '/api/admin/export-chats'
        : `/api/admin/export-chats?course_id=${courseId}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStats({
          totalStudents: data.totalStudents,
          totalConversations: data.totalConversations,
          totalMessages: data.totalMessages,
        })
      }
    }
    catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // 课程选择变化时更新统计
  useEffect(() => {
    fetchStats(selectedCourse)
  }, [selectedCourse])

  // 导出JSON
  const handleExport = async () => {
    setIsLoading(true)

    try {
      const url = selectedCourse === 'all'
        ? '/api/admin/export-chats'
        : `/api/admin/export-chats?course_id=${selectedCourse}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        // 生成文件名
        const timestamp = new Date().toISOString().split('T')[0]
        const courseName = selectedCourse === 'all' ? 'all' : selectedCourse
        const filename = `chat_export_${courseName}_${timestamp}.json`

        // 创建Blob并下载
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()

        Toast.notify({ type: 'success', message: `成功导出 ${data.totalMessages} 条聊天记录` })
      }
      else {
        Toast.notify({ type: 'error', message: data.message || '导出失败' })
      }
    }
    catch (error) {
      console.error('Export error:', error)
      Toast.notify({ type: 'error', message: '导出时出错' })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">聊天记录导出</h3>
        <p className="text-sm text-gray-500">
          导出学生与AI的完整对话记录，包含学生姓名、学号、课程号、时间戳等信息
        </p>
      </div>

      {/* 课程筛选 */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择课程
          </label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部课程</option>
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseId} - {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* 统计信息预览 */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-gray-600">学生数量</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-gray-600">对话数量</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalConversations}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <div className="text-sm text-gray-600">消息数量</div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalMessages}</div>
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={isLoading || !stats || stats.totalMessages === 0}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          {isLoading ? '导出中...' : '导出JSON文件'}
        </button>

        {stats && stats.totalMessages === 0 && (
          <p className="text-sm text-gray-500 text-center mt-2">
            当前筛选条件下没有聊天记录
          </p>
        )}
      </div>

      {/* 导出格式说明 */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">导出格式说明</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>文件格式：JSON</li>
          <li>文件命名：chat_export_[课程号]_[日期].json</li>
          <li>包含字段：学生姓名、学号、课程号、对话ID、消息类型、内容、时间戳</li>
          <li>数据结构：按学生分组，每个学生包含多个对话，每个对话包含多条消息</li>
          <li>可使用Python、JavaScript等工具进一步分析处理</li>
        </ul>
      </div>
    </div>
  )
}
