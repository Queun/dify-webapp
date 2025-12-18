'use client'

import React, { useState, useEffect } from 'react'
import type { User } from '@/types/auth'
import { getUserList, addUser, deleteUser, importUsersFromCSV } from '@/utils/auth'
import Toast from '@/app/components/base/toast'
import { PlusIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', studentId: '' })
  const [csvContent, setCsvContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // 加载用户列表
  const loadUsers = async () => {
    const userList = await getUserList()
    setUsers(userList)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 添加用户
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.studentId) {
      Toast.notify({ type: 'error', message: '请填写完整信息' })
      return
    }

    setIsLoading(true)
    try {
      const result = await addUser(newUser)
      if (result.success) {
        Toast.notify({ type: 'success', message: '用户添加成功' })
        setNewUser({ name: '', studentId: '' })
        setShowAddModal(false)
        loadUsers()
      } else {
        Toast.notify({ type: 'error', message: result.message || '添加失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '添加用户时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 删除用户
  const handleDeleteUser = async (studentId: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm('确定要删除此用户吗？')) { return }

    setIsLoading(true)
    try {
      const result = await deleteUser(studentId)
      if (result.success) {
        Toast.notify({ type: 'success', message: '用户删除成功' })
        loadUsers()
      } else {
        Toast.notify({ type: 'error', message: result.message || '删除失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '删除用户时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 批量删除用户
  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) {
      Toast.notify({ type: 'error', message: '请先选择要删除的用户' })
      return
    }

    // eslint-disable-next-line no-alert
    if (!confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？`)) { return }

    setIsLoading(true)
    try {
      const studentIds = Array.from(selectedUsers)
      const response = await fetch('/api/users/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds }),
      })

      const result = await response.json()
      if (result.success) {
        Toast.notify({ type: 'success', message: `成功删除 ${result.deleted} 个用户` })
        setSelectedUsers(new Set())
        loadUsers()
      } else {
        Toast.notify({ type: 'error', message: result.message || '批量删除失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '批量删除用户时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 切换用户选择
  const toggleUserSelection = (studentId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedUsers(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.studentId)))
    }
  }

  // 编辑用户 - 已移除，用户可以删除后重新导入

  // 导入CSV
  const handleImportCSV = async () => {
    if (!csvContent.trim()) {
      Toast.notify({ type: 'error', message: '请输入CSV内容' })
      return
    }

    setIsLoading(true)
    try {
      const result = await importUsersFromCSV(csvContent)
      if (result.success) {
        Toast.notify({ type: 'success', message: result.message || '导入成功' })
        setCsvContent('')
        setShowImportModal(false)
        loadUsers()
      } else {
        Toast.notify({ type: 'error', message: result.message || '导入失败' })
      }
    } catch (_error) {
      Toast.notify({ type: 'error', message: '导入用户时出错' })
    } finally {
      setIsLoading(false)
    }
  }

  // 导出CSV模板
  const handleDownloadTemplate = () => {
    const csvTemplate = '学号,姓名\n2024001,张三\n2024002,李四'
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'user_template.csv'
    link.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">用户管理</h3>
          {selectedUsers.size > 0 && (
            <span className="text-sm text-gray-600">
              已选择 {selectedUsers.size} 个用户
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {selectedUsers.size > 0 && (
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
            添加用户
          </button>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUsers.size === users.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                学号
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
            {users.map(user => (
              <tr key={user.studentId} className={selectedUsers.has(user.studentId) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.studentId)}
                    onChange={() => toggleUserSelection(user.studentId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleDeleteUser(user.studentId)}
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

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无用户数据
          </div>
        )}
      </div>

      {/* 添加用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-medium mb-4">添加用户</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                <input
                  type="text"
                  value={newUser.studentId}
                  onChange={e => setNewUser({ ...newUser, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={handleAddUser}
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
            <h4 className="text-lg font-medium mb-4">批量导入用户</h4>

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
                CSV内容 (格式：学号,姓名 或 学号 姓名)
              </label>
              <textarea
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="学号,姓名
2024001,张三
2024002,李四

或从Excel复制（空格分隔）：
2024001 张三
2024002 李四"
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
