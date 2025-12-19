'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminLoginFormData } from '@/types/auth'
import { adminLogin, isAdminLoggedIn } from '@/utils/auth'
import Toast from '@/app/components/base/toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AdminLoginFormData>({
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  // 如果已经是管理员登录状态，重定向到管理页面
  useEffect(() => {
    const checkAdmin = () => {
      const isAdmin = isAdminLoggedIn()
      if (isAdmin) {
        router.push('/admin')
      }
    }
    checkAdmin()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[AdminLogin] Form submitted', formData)
    setIsLoading(true)

    try {
      const result = await adminLogin(formData)
      if (result.success) {
        Toast.notify({ type: 'success', message: '管理员登录成功！' })
        setTimeout(() => {
          router.push('/admin')
        }, 100)
      } else {
        Toast.notify({ type: 'error', message: result.message || '登录失败' })
      }
    } catch (error) {
      console.error('[AdminLogin] Error during admin login:', error)
      Toast.notify({ type: 'error', message: '登录过程中出现错误' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理员登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入管理员密码以访问系统管理界面
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                管理员密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入管理员密码"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              返回用户登录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
