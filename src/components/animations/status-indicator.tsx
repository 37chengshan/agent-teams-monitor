'use client'

/**
 * StatusIndicator - 状态指示器组件
 * 支持脉冲动画和颜色变化
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { pulseAnimation } from '@/lib/animations'

export type Status = 'online' | 'offline' | 'busy' | 'error' | 'warning'

interface StatusIndicatorProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
  className?: string
}

const statusColors: Record<Status, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-yellow-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
}

const sizeStyles = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function StatusIndicator({
  status,
  size = 'md',
  showPulse = true,
  className,
}: StatusIndicatorProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full',
          statusColors[status],
          sizeStyles[size]
        )}
      />
      {showPulse && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            statusColors[status]
          )}
          animate={pulseAnimation}
        />
      )}
    </div>
  )
}
