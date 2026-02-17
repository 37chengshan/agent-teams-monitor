import fs from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/utils/logger'

/**
 * 文件读取结果
 */
export interface FileReadResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 安全地读取 JSON 文件
 */
export async function readJsonFile<T>(filepath: string): Promise<FileReadResult<T>> {
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    const data = JSON.parse(content) as T
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to read JSON file ${filepath}: ${message}`)
    return { success: false, error: message }
  }
}

/**
 * 读取目录下的所有文件
 */
export async function readDirectoryFiles(
  dirpath: string,
  extension?: string
): Promise<string[]> {
  try {
    const files = await fs.readdir(dirpath, { withFileTypes: true })

    const filePaths = files
      .filter((dirent) => dirent.isFile())
      .map((dirent) => path.join(dirpath, dirent.name))

    if (extension) {
      return filePaths.filter((filepath) => filepath.endsWith(extension))
    }

    return filePaths
  } catch (error) {
    logger.error(`Failed to read directory ${dirpath}: ${error}`)
    return []
  }
}

/**
 * 递归读取目录下的所有文件
 */
export async function readDirectoryFilesRecursive(
  dirpath: string,
  extension?: string
): Promise<string[]> {
  const files: string[] = []

  async function traverse(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)

        if (entry.isDirectory()) {
          await traverse(fullPath)
        } else if (entry.isFile()) {
          if (!extension || fullPath.endsWith(extension)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to traverse directory ${currentPath}: ${error}`)
    }
  }

  await traverse(dirpath)
  return files
}
