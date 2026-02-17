'use client'

/**
 * MotionList - 支持交错动画的列表组件
 * 列表项会依次出现，产生流畅的级联效果
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface MotionListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delay?: number
}

interface MotionListItemProps {
  children: React.ReactNode
  className?: string
}

export function MotionList({
  children,
  className,
  staggerDelay = 0.1,
  delay = 0,
}: MotionListProps) {
  const containerVariants = {
    ...staggerContainer,
    visible: {
      ...staggerContainer.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export function MotionListItem({ children, className }: MotionListItemProps) {
  return (
    <motion.div variants={staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  )
}
