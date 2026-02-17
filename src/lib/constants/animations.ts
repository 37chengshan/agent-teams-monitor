/**
 * Framer Motion 动画变体配置
 */
export const animations = {
  // 页面加载淡入
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  // 列表项进入
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 }
  },

  // 卡片缩放进入
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },

  // 交错子元素
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    }
  },

  // 消息滑入
  messageSlide: {
    initial: { opacity: 0, x: 50, maxHeight: 0 },
    animate: { opacity: 1, x: 0, maxHeight: 200 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // 数据更新闪烁
  updateFlash: {
    highlight: {
      backgroundColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0)'],
      transition: { duration: 0.6 }
    }
  },

  // 状态变化过渡
  statusChange: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 0.3, times: [0, 0.5, 1] }
  },

  // 淡入动画
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  // 滑入动画（从右侧）
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // 滑入动画（从左侧）
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // 缩放进入
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2, ease: 'easeOut' }
  }
} as const

/**
 * 动画延迟配置
 */
export const animationDelays = {
  short: 0.05,
  medium: 0.1,
  long: 0.2
} as const

/**
 * 动画时长配置
 */
export const animationDurations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5
} as const
