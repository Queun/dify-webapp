'use client'
import type { FC } from 'react'
import React from 'react'

export interface DiscussionBubbleProps {
  speaker: string
  content: string
  order: number
}

/**
 * 获取角色配置（头像、颜色等）
 */
function getSpeakerConfig(speaker: string) {
  const configs: Record<string, { bgColor: string, textColor: string, borderColor: string, icon: string }> = {
    SRL助教: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: '👨‍🏫',
    },
    友好的同桌: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '🤝',
    },
    学术写作专家: {
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      icon: '✍️',
    },
    // 向后兼容旧名称
    同桌: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '🤝',
    },
    学术专家: {
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      icon: '✍️',
    },
  }

  return configs[speaker] || {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: '💬',
  }
}

/**
 * 对话气泡组件 - 显示单条发言
 */
const DiscussionBubble: FC<DiscussionBubbleProps> = ({ speaker, content, order }) => {
  const config = getSpeakerConfig(speaker)

  return (
    <div className="flex items-start gap-4">
      {/* 头像 - 增强阴影和尺寸 */}
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor} ${config.textColor} text-lg shadow-md ring-2 ring-white`}>
        {config.icon}
      </div>

      {/* 内容气泡 */}
      <div className="flex-1 min-w-0">
        {/* 角色名称 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {speaker}
          </span>
          <span className="text-xs text-gray-400">
            #{order + 1}
          </span>
        </div>

        {/* 对话内容 - 增强阴影和边框 */}
        <div className={`px-4 py-3.5 rounded-xl border-2 ${config.bgColor} ${config.borderColor} shadow-lg hover:shadow-xl transition-shadow duration-200`}>
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default React.memo(DiscussionBubble)
