'use client'

/**
 * AnimatedCard - 带悬停动画效果的卡片组件
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardHover } from '@/lib/animations'
import { Card } from '@/components/ui/card'

interface AnimatedCardProps {
  hover?: boolean
  clickScale?: number
  className?: string
  children: React.ReactNode
}

export function AnimatedCard({
  hover = true,
  clickScale = 0.98,
  className,
  children,
}: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={hover ? cardHover : undefined}
      whileTap={{ scale: clickScale }}
      className={cn(className)}
    >
      <Card className="h-full">{children}</Card>
    </motion.div>
  )
}



