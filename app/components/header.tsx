'use client'
import type { FC } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'
import { getCurrentUser, logout } from '@/utils/auth'
import Toast from '@/app/components/base/toast'

export interface IHeaderProps {
  title: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: FC<IHeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  const router = useRouter()
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logout()
    Toast.notify({
      type: 'success',
      message: '已退出登录',
    })
    router.push('/login')
  }

  return (
    <div className="shrink-0 flex items-center justify-between h-12 px-3 bg-gray-100">
      {isMobile
        ? (
          <div
            className='flex items-center justify-center h-8 w-8 cursor-pointer'
            onClick={() => onShowSideBar?.()}
          >
            <Bars3Icon className="h-4 w-4 text-gray-500" />
          </div>
        )
        : <div></div>}
      <div className='flex items-center space-x-2'>
        <AppIcon size="small" />
        <div className=" text-sm text-gray-800 font-bold">{title}</div>
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center space-x-3">
        {/* User Info */}
        {currentUser && (
          <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-600">
            <span className="font-medium">{currentUser.name}</span>
            <span className="text-gray-400">|</span>
            <span>{currentUser.courseId}</span>
          </div>
        )}

        {/* Mobile: New Chat Button */}
        {isMobile && (
          <div className='flex items-center justify-center h-8 w-8 cursor-pointer' onClick={() => onCreateNewChat?.()}>
            <PencilSquareIcon className="h-4 w-4 text-gray-500" />
          </div>
        )}

        {/* Logout Button */}
        <div
          className='flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-gray-200 rounded transition-colors'
          onClick={handleLogout}
          title="退出登录"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  )
}

export default React.memo(Header)
