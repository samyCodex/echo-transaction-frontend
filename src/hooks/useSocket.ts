'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Initialize socket connection with error handling
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
        userId: userId
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    })

    const socket = socketRef.current

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection failed (backend may not support WebSocket):', error.message)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [userId])

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback)
      } else {
        socketRef.current.off(event)
      }
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  }
}
