import type { Metadata } from 'next'
import LoginForm from '@/app/components/auth/login-form'

export const metadata: Metadata = {
  title: '登录 - Dify Conversation',
  description: '学生登录页面',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
