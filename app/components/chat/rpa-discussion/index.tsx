'use client'
import type { FC } from 'react'
import React from 'react'
import DiscussionBubble from './discussion-bubble'

// 支持两种数据格式：
// 1. speaker + content (原始设计)
// 2. role + dialogue (Dify实际返回)
export interface RpaDiscussionItem {
  speaker?: string // "SRL助教" | "同桌" | "学术专家"
  content?: string
  role?: string // 与speaker相同
  dialogue?: string // 与content相同
  order?: number
}

export interface RpaDiscussionProps {
  discussionScript: RpaDiscussionItem[]
  className?: string
}

/**
 * RPA对话框组件 - 以对话形式展示RPA多智能体的讨论过程
 * 三个角色：SRL助教、同桌、学术专家
 */
const RpaDiscussion: FC<RpaDiscussionProps> = ({ discussionScript, className = '' }) => {
  if (!discussionScript || discussionScript.length === 0) {
    return null
  }

  return (
    <div className={`rpa-discussion space-y-3 ${className}`}>
      {/* 讨论标题 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6.5L5.5 8L8.5 4M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700">多智能体讨论</span>
      </div>

      {/* 对话气泡列表 */}
      <div className="space-y-4">
        {discussionScript.map((item, index) => {
          // 兼容两种格式：优先使用 role/dialogue，回退到 speaker/content
          const speaker = item.role || item.speaker || '未知'
          const content = item.dialogue || item.content || ''

          return (
            <DiscussionBubble
              key={index}
              speaker={speaker}
              content={content}
              order={item.order ?? index}
            />
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(RpaDiscussion)
