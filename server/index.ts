import { createServer as createHttpServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { createSocketServer } from './socket/server'
import { setupFileWatchHandlers } from './socket/handlers'
import { fileWatcherManager } from './watchers'
import { logger } from '@/lib/utils/logger'

/**
 * 启动自定义服务器
 * 整合 Next.js 和 Socket.IO
 */
async function startServer() {
  const dev = process.env.NODE_ENV !== 'production'
  const port = Number(process.env.PORT) || 3000
  const hostname = process.env.HOSTNAME || 'localhost'

  logger.info(`Starting server in ${dev ? 'development' : 'production'} mode`)

  // 创建 Next.js 应用
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  // 准备 Next.js 应用
  await app.prepare()
  logger.info('Next.js app prepared')

  // 创建 HTTP 服务器
  const httpServer = createHttpServer(async (req, res) => {
    try {
      // 解析 URL
      const parsedUrl = parse(req.url!, true)

      // 让 Next.js 处理请求
      await handle(req, res, parsedUrl)
    } catch (err) {
      logger.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // 创建 Socket.IO 服务器
  const io = createSocketServer(httpServer)
  logger.info('Socket.IO server created')

  // 设置文件监控事件处理器
  setupFileWatchHandlers()

  // 启动文件监控器
  try {
    await fileWatcherManager.start()
    logger.info('File watcher started')
  } catch (error) {
    logger.error(`Failed to start file watcher: ${error}`)
  }

  // 启动 HTTP 服务器
  httpServer
    .once('error', (err) => {
      logger.error(`Server error: ${err}`)
      process.exit(1)
    })
    .listen(port, () => {
      logger.info(`> Ready on http://${hostname}:${port}`)
    })

  // 优雅关闭
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`)

    try {
      // 停止文件监控器
      await fileWatcherManager.stop()
      logger.info('File watcher stopped')

      // 关闭 HTTP 服务器
      httpServer.close(() => {
        logger.info('HTTP server closed')
      })

      // 关闭 Socket.IO 服务器
      await new Promise<void>((resolve) => {
        if (io) {
          io.close(() => {
            resolve()
          })
        } else {
          resolve()
        }
      })
      logger.info('Socket.IO server closed')

      process.exit(0)
    } catch (error) {
      logger.error(`Error during shutdown: ${error}`)
      process.exit(1)
    }
  }

  // 监听退出信号
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

// 启动服务器
startServer().catch((error) => {
  logger.error(`Failed to start server: ${error}`)
  process.exit(1)
})

// 导出服务器实例供测试使用
export { startServer }
