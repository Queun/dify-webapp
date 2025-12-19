'use client'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { IMainProps } from '@/app/components'
import Main from '@/app/components'
import { verifyUser } from '@/service/auth'

const App: FC<IMainProps> = ({
  params,
}: any) => {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { isLoggedIn: loggedIn } = await verifyUser()
      setIsLoggedIn(loggedIn)
      setIsChecking(false)

      if (!loggedIn) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  // 如果正在检查或未登录，显示loading
  if (isChecking || !isLoggedIn) {
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
