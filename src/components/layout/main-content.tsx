'use client'

/**
 * MainContent - 主内容区域组件
 */

import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
  className?: string
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={`flex-1 overflow-auto p-6 ${className || ''}`}>
      {children}
    </main>
  )
}
