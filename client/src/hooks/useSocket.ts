'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketOptions {
  url?: string
  autoConnect?: boolean
}

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  connectionError: Error | null
}

export function useSocket(options: UseSocketOptions = {}) {
  const { url = 'http://localhost:3001', autoConnect = true } = options

  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    connectionError: null,
  })

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (socketRef.current) return

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setState({
        socket,
        isConnected: true,
        connectionError: null,
      })
    })

    socket.on('disconnect', () => {
      setState((prev) => ({ ...prev, isConnected: false }))
    })

    socket.on('connect_error', (error) => {
      setState((prev) => ({ ...prev, connectionError: error as Error }))
    })

    if (autoConnect) {
      socket.connect()
    }

    setState((prev) => ({ ...prev, socket }))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [url, autoConnect])

  const connect = useCallback(() => {
    socketRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, callback)
    return () => {
      socketRef.current?.off(event, callback)
    }
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on,
  }
}
