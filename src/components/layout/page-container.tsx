'use client'

/**
 * PageContainer - 页面包装组件（带动画容器）
 */

import { ReactNode } from 'react'
import { MotionContainer } from '@/components/animations/motion-container'

interface PageContainerProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export function PageContainer({
  children,
  className,
  title,
  description,
}: PageContainerProps) {
  return (
    <MotionContainer className={`container space-y-6 ${className || ''}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </MotionContainer>
  )
}
