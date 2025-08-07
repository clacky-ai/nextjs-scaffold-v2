import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface VoteUpdateData {
  projectId: string
  projectTitle: string
  newVoteCount: number
  voterName: string
}

interface SystemStatusUpdateData {
  isVotingEnabled: boolean
  maxVotesPerUser: number
}

interface AdminMessageData {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  from: string
  timestamp: number
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const voteUpdateCallbackRef = useRef<((data: VoteUpdateData) => void) | null>(null)
  const systemStatusUpdateCallbackRef = useRef<((data: SystemStatusUpdateData) => void) | null>(null)
  const adminMessageCallbackRef = useRef<((data: AdminMessageData) => void) | null>(null)

  useEffect(() => {
    // 获取当前页面的URL来构建Socket.IO连接地址
    const getSocketUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:3001'
      
      // 使用当前页面的origin
      return window.location.origin
    }

    // 创建Socket.IO连接
    const socket = io(getSocketUrl(), {
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      // 传输配置 - 先尝试polling再升级到websocket
      transports: ['polling', 'websocket'],
      // 升级配置
      upgrade: true,
      // 连接超时
      timeout: 20000,
      // 强制新连接
      forceNew: false
    })

    socketRef.current = socket
    console.log('🔄 尝试连接Socket.IO到:', getSocketUrl() + '/api/socket')

    // 连接事件
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Socket.IO连接已建立:', socket.id)
      console.log('🚀 当前传输方式:', socket.io.engine.transport.name)

      // 监听传输升级
      socket.io.engine.on('upgrade', () => {
        console.log('传输已升级到:', socket.io.engine.transport.name)
      })

      socket.io.engine.on('upgradeError', (error) => {
        console.error('传输升级失败:', error)
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('❌ Socket.IO连接断开')
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO连接错误:', error)
      if (error && typeof error === 'object') {
        console.error('❌ 错误类型:', (error as any).type)
        console.error('❌ 错误描述:', (error as any).description)
      }
      setIsConnected(false)
    })

    // 连接确认消息
    socket.on('connection', (data) => {
      console.log('🎯 连接确认:', data.message)
    })

    // 认证成功确认
    socket.on('auth-success', (data) => {
      console.log('🎉 认证成功确认:', data)
    })

    // 投票更新事件
    socket.on('vote-update', (data: VoteUpdateData) => {
      console.log('收到投票更新:', data)
      if (voteUpdateCallbackRef.current) {
        voteUpdateCallbackRef.current(data)
      }
    })

    // 系统状态更新事件
    socket.on('system-status-update', (data: SystemStatusUpdateData) => {
      console.log('收到系统状态更新:', data)
      if (systemStatusUpdateCallbackRef.current) {
        systemStatusUpdateCallbackRef.current(data)
      }
    })

    // 管理员消息事件
    socket.on('admin-message', (data: AdminMessageData) => {
      console.log('收到管理员消息:', data)
      if (adminMessageCallbackRef.current) {
        adminMessageCallbackRef.current(data)
      }
    })

    // Pong响应
    socket.on('pong', (data) => {
      console.log('收到pong:', data)
    })

    return () => {
      console.log('清理Socket.IO连接')
      socket.disconnect()
      setIsConnected(false)
    }
  }, [])

  // 发送消息到Socket.IO服务器
  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data)
      return true
    }
    console.warn('Socket.IO未连接，无法发送消息')
    return false
  }

  const joinVotingRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-voting')
      socketRef.current.emit('join-room', { room: 'voting' })
      console.log('已加入投票房间')
    }
  }

  const leaveVotingRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-voting')
      socketRef.current.emit('leave-room', { room: 'voting' })
      console.log('已离开投票房间')
    }
  }

  const onVoteUpdate = (callback: (data: VoteUpdateData) => void) => {
    voteUpdateCallbackRef.current = callback
  }

  const onSystemStatusUpdate = (callback: (data: SystemStatusUpdateData) => void) => {
    systemStatusUpdateCallbackRef.current = callback
  }

  const offVoteUpdate = () => {
    voteUpdateCallbackRef.current = null
  }

  const offSystemStatusUpdate = () => {
    systemStatusUpdateCallbackRef.current = null
  }

  const onAdminMessage = (callback: (data: AdminMessageData) => void) => {
    adminMessageCallbackRef.current = callback
  }

  const offAdminMessage = () => {
    adminMessageCallbackRef.current = null
  }

  // 用户认证
  const authenticate = (userData: { userId?: string; userName?: string; userEmail?: string; isAdmin?: boolean }) => {
    if (socketRef.current) {
      socketRef.current.emit('auth', userData)
      console.log('发送用户认证:', userData)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    authenticate,
    joinVotingRoom,
    leaveVotingRoom,
    onVoteUpdate,
    onSystemStatusUpdate,
    onAdminMessage,
    offVoteUpdate,
    offSystemStatusUpdate,
    offAdminMessage,
  }
}
