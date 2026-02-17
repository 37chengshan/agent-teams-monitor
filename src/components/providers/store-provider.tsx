'use client'

/**
 * StoreProvider - Zustand 状态管理提供者（用于 SSR 场景）
 *
 * 注意: Zustand 默认不需要 Provider，这个组件主要用于:
 * 1. 服务端渲染时初始化状态
 * 2. 测试时隔离状态
 * 3. 未来可能的多实例需求
 */

import { ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Zustand stores 是单例，不需要显式 Provider
  // 这个组件作为占位符，未来可用于 SSR 状态初始化
  return <>{children}</>
}
