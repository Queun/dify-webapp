'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LoginFormData } from '@/types/auth'
import { userLogin } from '@/service/auth'
import Toast from '@/app/components/base/toast'

export interface LoginFormProps {
  className?: string
}

const LoginForm: FC<LoginFormProps> = ({ className = '' }) => {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    name: '',
    studentId: '',
    courseId: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Login] Form submitted', formData)
    setIsLoading(true)

    try {
      console.log('[Login] Calling login function...')
      const result = await userLogin(formData)
      console.log('[Login] Login result:', result)

      if (result.success) {
        console.log('[Login] Login successful, redirecting...')
        Toast.notify({
          type: 'success',
          message: '登录成功！',
        })
        // 跳转到主页
        setTimeout(() => {
          router.push('/')
        }, 100)
      }
      else {
        console.log('[Login] Login failed:', result.message)
        Toast.notify({
          type: 'error',
          message: result.message || '登录失败',
        })
      }
    }
    catch (error) {
      console.error('[Login] Error during login:', error)
      Toast.notify({
        type: 'error',
        message: '登录失败，请重试',
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎使用
          </h1>
          <p className="text-gray-600">
            请输入您的学生信息登录
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* 学号 */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              学号
            </label>
            <input
              id="studentId"
              type="text"
              value={formData.studentId}
              onChange={e => handleInputChange('studentId', e.target.value)}
              placeholder="请输入学号"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* 课程号 */}
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
              课程号
            </label>
            <input
              id="courseId"
              type="text"
              value={formData.courseId}
              onChange={e => handleInputChange('courseId', e.target.value)}
              placeholder="请输入课程号"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-primary-600 hover:bg-primary-600/75 text-white rounded-lg cursor-pointer disabled:bg-primary-600/75 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>首次使用？请联系管理员添加您的账号</p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
