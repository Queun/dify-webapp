'use client'
import type { FC } from 'react'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { IMainProps } from '@/app/components'
import Main from '@/app/components'
import { initializeSystemData, isLoggedIn } from '@/utils/auth'

const App: FC<IMainProps> = ({
  params,
}: any) => {
  const router = useRouter()

  useEffect(() => {
    // 初始化系统数据
    initializeSystemData()

    // 检查登录状态
    if (!isLoggedIn()) {
      router.push('/login')
    }
  }, [router])

  // 如果未登录，显示loading或空白
  if (!isLoggedIn()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">正在检查登录状态...</div>
      </div>
    )
  }

  return (
    <Main params={params} />
  )
}

export default React.memo(App)
