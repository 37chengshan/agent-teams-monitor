import { describe, it, expect } from 'vitest'
import { Parser } from '../src/services/parser'
import { ProtocolMessageType } from '../src/types'

describe('Parser', () => {
  const parser = new Parser()

  describe('detectProtocolType', () => {
    it('should detect shutdown_request', () => {
      const result = parser.detectProtocolType('shutdown_request: please confirm')
      expect(result).toBe(ProtocolMessageType.SHUTDOWN_REQUEST)
    })

    it('should detect plan_approval_request', () => {
      const result = parser.detectProtocolType('plan_approval_request: needs approval')
      expect(result).toBe(ProtocolMessageType.PLAN_APPROVAL_REQUEST)
    })

    it('should detect plan_approval_response', () => {
      const result = parser.detectProtocolType('plan_approval_response: approved')
      expect(result).toBe(ProtocolMessageType.PLAN_APPROVAL_RESPONSE)
    })

    it('should detect idle_notification', () => {
      const result = parser.detectProtocolType('idle_notification: agent is idle')
      expect(result).toBe(ProtocolMessageType.IDLE_NOTIFICATION)
    })

    it('should return null for regular messages', () => {
      const result = parser.detectProtocolType('Hello, how are you?')
      expect(result).toBeNull()
    })
  })

  describe('parseInboxFile', () => {
    it('should parse valid JSON array', () => {
      const content = JSON.stringify([
        { from: 'agent-1', text: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
      ])

      const result = parser.parseInboxFile('team-1', 'agent-1', '/path/to/file.json', content)

      expect(result).toHaveLength(1)
      expect(result[0].from).toBe('agent-1')
      expect(result[0].text).toBe('Hello')
    })

    it('should handle empty content', () => {
      const result = parser.parseInboxFile('team-1', 'agent-1', '/path/to/file.json', '')
      expect(result).toHaveLength(0)
    })

    it('should detect protocol type in message', () => {
      const content = JSON.stringify([
        { from: 'agent-1', text: 'shutdown_request: confirm', timestamp: '2024-01-01T00:00:00Z' },
      ])

      const result = parser.parseInboxFile('team-1', 'agent-1', '/path/to/file.json', content)

      expect(result[0].type).toBe('protocol')
      expect(result[0].protocolType).toBe(ProtocolMessageType.SHUTDOWN_REQUEST)
    })
  })
})
