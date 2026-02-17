'use client'

/**
 * MotionContainer - 通用动画容器组件
 * 支持淡入、滑入、缩放等动画效果
 */

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeIn, scaleIn, slideIn } from '@/lib/animations'

export type AnimationType = 'fade' | 'scale' | 'slide'

interface MotionContainerProps {
  children: React.ReactNode
  animation?: AnimationType
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  variants?: Variants
}

export function MotionContainer({
  children,
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 0.3,
  className,
  variants,
}: MotionContainerProps) {
  // 选择预设动画变体
  const getVariants = (): Variants => {
    if (variants) return variants

    switch (animation) {
      case 'scale':
        return scaleIn
      case 'slide':
        return slideIn
      case 'fade':
      default:
        return fadeIn
    }
  }

  const selectedVariants = getVariants()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={selectedVariants}
      custom={direction}
      transition={duration !== undefined || delay !== undefined ? { duration, delay } : undefined}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
