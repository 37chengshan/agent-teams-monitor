/**
 * 简单的日志工具
 */
const LOG_PREFIX = '[Agent Teams Monitor]'

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${LOG_PREFIX} [INFO]`, message, ...args)
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${LOG_PREFIX} [WARN]`, message, ...args)
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(`${LOG_PREFIX} [ERROR]`, message, ...args)
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${LOG_PREFIX} [DEBUG]`, message, ...args)
    }
  }
}
