'use client'

import React, { useState, useEffect } from 'react'
import { getChatStatistics, exportChatHistoryToCSV } from '@/utils/auth'
import Toast from '@/app/components/base/toast'
import { DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function DataExport() {
  const [isLoading, setIsLoading] = useState(false)
  const [statistics, setStatistics] = useState({
    totalConversations: 0,
    totalUsers: 0,
    userStats: [] as any[],
  })

  // 加载统计数据
  const loadStatistics = () => {
    try {
      const stats = getChatStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load chat statistics:', error)
      Toast.notify({ type: 'error', message: '加载统计数据失败' })
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  // 导出聊天记录
  const handleExportChatHistory = async () => {
    setIsLoading(true)
    try {
      const csvContent = exportChatHistoryToCSV()

      if (!csvContent || csvContent.trim() === '学号,姓名,课程号,对话ID,时间,类型,内容') {
        Toast.notify({ type: 'warning', message: '暂无聊天记录可导出' })
        return
      }

      // 创建并下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `chat_history_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      Toast.notify({ type: 'success', message: '聊天记录导出成功' })
    } catch (error) {
      console.error('Export error:', error)
      Toast.notify({ type: 'error', message: '导出聊天记录时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 导出用户统计报告
  const handleExportUserStats = async () => {
    setIsLoading(true)
    try {
      const csvRows: string[] = []
      csvRows.push('学号,姓名,课程号,对话数量,最后活动时间')

      statistics.userStats.forEach(({ studentId, studentName, courseId, conversationCount, lastActivity }) => {
        const lastActivityFormatted = lastActivity
          ? new Date(lastActivity).toLocaleString('zh-CN')
          : '无活动记录'
        csvRows.push(`"${studentId}","${studentName}","${courseId}","${conversationCount}","${lastActivityFormatted}"`)
      })

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `user_statistics_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      Toast.notify({ type: 'success', message: '用户统计报告导出成功' })
    } catch (error) {
      console.error('Export error:', error)
      Toast.notify({ type: 'error', message: '导出用户统计时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">数据导出</h3>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-blue-600">总对话数</div>
              <div className="text-2xl font-bold text-blue-900">{statistics.totalConversations}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-green-600">活跃用户数</div>
              <div className="text-2xl font-bold text-green-900">{statistics.totalUsers}</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-purple-600">平均对话数</div>
              <div className="text-2xl font-bold text-purple-900">
                {statistics.totalUsers > 0
                  ? Math.round(statistics.totalConversations / statistics.totalUsers * 10) / 10
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导出功能 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-800 mb-4">导出选项</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 聊天记录导出 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <DocumentArrowDownIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h5 className="font-medium text-gray-900">完整聊天记录</h5>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              导出所有用户的完整聊天记录，包含问题、回答和时间戳信息，适合详细分析。
            </p>
            <ul className="text-xs text-gray-500 mb-4">
              <li>• 包含用户问题和AI回答</li>
              <li>• 时间戳和用户标识</li>
              <li>• CSV格式，便于数据分析</li>
            </ul>
            <button
              onClick={handleExportChatHistory}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              {isLoading ? '导出中...' : '导出聊天记录'}
            </button>
          </div>

          {/* 用户统计导出 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h5 className="font-medium text-gray-900">用户活动统计</h5>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              导出用户活动统计报告，包含每个用户的对话数量和最后活动时间。
            </p>
            <ul className="text-xs text-gray-500 mb-4">
              <li>• 用户基本信息和课程</li>
              <li>• 对话数量统计</li>
              <li>• 最后活动时间</li>
            </ul>
            <button
              onClick={handleExportUserStats}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <ChartBarIcon className="w-4 h-4 mr-1" />
              {isLoading ? '导出中...' : '导出用户统计'}
            </button>
          </div>
        </div>
      </div>

      {/* 用户活动详情 */}
      {statistics.userStats.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-800 mb-4">用户活动详情</h4>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    课程号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    对话数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后活动
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.userStats
                  .sort((a, b) => b.conversationCount - a.conversationCount) // 按对话数量排序
                  .map(({ studentId, studentName, courseId, conversationCount, lastActivity }) => (
                    <tr key={`${studentId}_${courseId}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {courseId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conversationCount > 10
                            ? 'bg-green-100 text-green-800'
                            : conversationCount > 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversationCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastActivity
                          ? new Date(lastActivity).toLocaleDateString('zh-CN')
                          : '无记录'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {statistics.userStats.length === 0 && (
        <div className="mt-8 text-center py-8 text-gray-500">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>暂无聊天记录数据</p>
        </div>
      )}
    </div>
  )
}
