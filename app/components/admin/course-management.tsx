'use client'

import React, { useState, useEffect } from 'react'
import type { Course } from '@/types/auth'
import { getCourseList, addCourse, deleteCourse, importCoursesFromCSV } from '@/utils/auth'
import Toast from '@/app/components/base/toast'
import { PlusIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ courseId: '', courseName: '' })
  const [csvContent, setCsvContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())

  // 加载课程列表
  const loadCourses = async () => {
    const courseList = await getCourseList()
    setCourses(courseList)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  // 添加课程
  const handleAddCourse = async () => {
    if (!newCourse.courseId) {
      Toast.notify({ type: 'error', message: '请填写课程号' })
      return
    }

    setIsLoading(true)
    try {
      const result = await addCourse(newCourse)
      if (result.success) {
        Toast.notify({ type: 'success', message: '课程添加成功' })
        setNewCourse({ courseId: '', courseName: '' })
        setShowAddModal(false)
        loadCourses()
      } else {
        Toast.notify({ type: 'error', message: result.message || '添加失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '添加课程时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 删除课程
  const handleDeleteCourse = async (courseId: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm('确定要删除此课程吗？删除后，使用此课程号的学生将无法登录。')) { return }

    setIsLoading(true)
    try {
      const result = await deleteCourse(courseId)
      if (result.success) {
        Toast.notify({ type: 'success', message: '课程删除成功' })
        loadCourses()
      } else {
        Toast.notify({ type: 'error', message: result.message || '删除失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '删除课程时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 批量删除课程
  const handleBatchDelete = async () => {
    if (selectedCourses.size === 0) {
      Toast.notify({ type: 'error', message: '请先选择要删除的课程' })
      return
    }

    // eslint-disable-next-line no-alert
    if (!confirm(`确定要删除选中的 ${selectedCourses.size} 个课程吗？删除后，使用这些课程号的学生将无法登录。`)) { return }

    setIsLoading(true)
    try {
      const courseIds = Array.from(selectedCourses)
      const response = await fetch('/api/courses/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      })

      const result = await response.json()
      if (result.success) {
        Toast.notify({ type: 'success', message: `成功删除 ${result.deleted} 个课程` })
        setSelectedCourses(new Set())
        loadCourses()
      } else {
        Toast.notify({ type: 'error', message: result.message || '批量删除失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '批量删除课程时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 切换课程选择
  const toggleCourseSelection = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId)
    } else {
      newSelected.add(courseId)
    }
    setSelectedCourses(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCourses.size === courses.length) {
      setSelectedCourses(new Set())
    } else {
      setSelectedCourses(new Set(courses.map(c => c.courseId)))
    }
  }

  // 编辑课程 - 已移除，可以删除后重新导入

  // 导入CSV
  const handleImportCSV = async () => {
    if (!csvContent.trim()) {
      Toast.notify({ type: 'error', message: '请输入CSV内容' })
      return
    }

    setIsLoading(true)
    try {
      const result = await importCoursesFromCSV(csvContent)
      if (result.success) {
        Toast.notify({ type: 'success', message: result.message || '导入成功' })
        setCsvContent('')
        setShowImportModal(false)
        loadCourses()
      } else {
        Toast.notify({ type: 'error', message: result.message || '导入失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '导入课程时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 导出CSV模板
  const handleDownloadTemplate = () => {
    const csvTemplate = '课程号,课程名称\nCS101,计算机科学导论\nMATH101,高等数学'
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'course_template.csv'
    link.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">课程管理</h3>
          {selectedCourses.size > 0 && (
            <span className="text-sm text-gray-600">
              已选择 {selectedCourses.size} 个课程
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {selectedCourses.size > 0 && (
            <button
              onClick={handleBatchDelete}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              批量删除
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
            批量导入
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            添加课程
          </button>
        </div>
      </div>

      {/* 课程列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={courses.length > 0 && selectedCourses.size === courses.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                课程号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                课程名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.courseId} className={selectedCourses.has(course.courseId) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course.courseId)}
                    onChange={() => toggleCourseSelection(course.courseId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.courseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.courseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleDeleteCourse(course.courseId)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无课程数据
          </div>
        )}
      </div>

      {/* 添加课程模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-medium mb-4">添加课程</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">课程号</label>
                <input
                  type="text"
                  value={newCourse.courseId}
                  onChange={e => setNewCourse({ ...newCourse, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">课程名称 (可选)</label>
                <input
                  type="text"
                  value={newCourse.courseName}
                  onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：计算机科学导论"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleAddCourse}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导入CSV模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h4 className="text-lg font-medium mb-4">批量导入课程</h4>

            <div className="mb-4">
              <button
                onClick={handleDownloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                下载CSV模板
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV内容 (格式：课程号,课程名称 或 课程号 课程名称)
              </label>
              <textarea
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="课程号,课程名称
CS101,计算机科学导论
MATH101,高等数学

或从Excel复制（空格分隔）：
CS101 计算机科学导论
MATH101 高等数学"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleImportCSV}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? '导入中...' : '导入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
