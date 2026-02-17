/**
 * Framer Motion 动画配置
 */

import type { Transition, Variants } from 'framer-motion'

/**
 * 基础过渡配置
 */
export const baseTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

/**
 * 淡入动画变体
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: baseTransition,
  },
  exit: {
    opacity: 0,
    transition: smoothTransition,
  },
}

/**
 * 滑入动画变体
 */
export const slideIn: Variants = {
  hidden: (direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
    const offset = 20
    const offsets = {
      left: { x: -offset, y: 0 },
      right: { x: offset, y: 0 },
      up: { x: 0, y: offset },
      down: { x: 0, y: -offset },
    }
    return {
      opacity: 0,
      ...offsets[direction],
    }
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: baseTransition,
  },
  exit: {
    opacity: 0,
    transition: smoothTransition,
  },
}

/**
 * 缩放动画变体
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: baseTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: smoothTransition,
  },
}

/**
 * 交错列表动画变体
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
  exit: {
    opacity: 0,
    transition: smoothTransition,
  },
}

/**
 * 卡片悬停效果
 */
export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
}

/**
 * 脉冲动画（用于状态指示器）
 */
export const pulseAnimation = {
  scale: [1, 1.1, 1],
  opacity: [1, 0.7, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    times: [0, 0.5, 1],
  },
}

/**
 * 旋转动画
 */
export const spinAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: [0, 0, 1, 1],
  },
}
