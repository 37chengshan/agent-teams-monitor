/**
 * API 路由测试
 *
 * 测试所有 API 端点的功能和响应格式
 */

import { describe, it, expect } from 'vitest'

describe('API Routes', () => {
  const baseUrl = 'http://localhost:3000'

  describe('GET /api/teams', () => {
    it('should return teams list with correct format', async () => {
      const response = await fetch(`${baseUrl}/api/teams`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should support search parameter', async () => {
      const response = await fetch(`${baseUrl}/api/teams?search=test`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should return 404 for non-existent team', async () => {
      const response = await fetch(`${baseUrl}/api/teams?id=non-existent`)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET /api/tasks', () => {
    it('should return tasks list with correct format', async () => {
      const response = await fetch(`${baseUrl}/api/tasks`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should support teamId filter', async () => {
      const response = await fetch(`${baseUrl}/api/tasks?teamId=test-team`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should support status filter', async () => {
      const response = await fetch(`${baseUrl}/api/tasks?status=pending`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should return 404 for non-existent task', async () => {
      const response = await fetch(`${baseUrl}/api/tasks?id=non-existent`)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET /api/inbox', () => {
    it('should return inbox messages with correct format', async () => {
      const response = await fetch(`${baseUrl}/api/inbox`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should support teamId filter', async () => {
      const response = await fetch(`${baseUrl}/api/inbox?teamId=test-team`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should support recipient filter', async () => {
      const response = await fetch(`${baseUrl}/api/inbox?recipient=test-user`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })

    it('should support unreadOnly filter', async () => {
      const response = await fetch(`${baseUrl}/api/inbox?unreadOnly=true`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })
  })

  describe('Error handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/teams?invalid-param=value`)
      const data = await response.json()

      // 应该忽略无效参数，返回正常响应
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })
  })
})
