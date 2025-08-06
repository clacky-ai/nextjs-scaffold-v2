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

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const voteUpdateCallbackRef = useRef<((data: VoteUpdateData) => void) | null>(null)
  const systemStatusUpdateCallbackRef = useRef<((data: SystemStatusUpdateData) => void) | null>(null)

  useEffect(() => {
    // 创建Socket.IO连接
    const socket = io({
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      // 传输配置 - 混合模式（推荐）
      transports: ['websocket', 'polling'],
      // 升级配置
      upgrade: true,
      // 连接超时
      timeout: 20000,
      // 强制新连接
      forceNew: false,
      // 调试模式（开发环境）
      ...(process.env.NODE_ENV === 'development' && {
        debug: true
      })
    })

    socketRef.current = socket
    console.log('尝试连接Socket.IO')

    // 连接事件
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Socket.IO连接已建立:', socket.id)
      console.log('当前传输方式:', socket.io.engine.transport.name)

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
      console.log('Socket.IO连接断开')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket.IO连接错误:', error)
      setIsConnected(false)
    })

    // 连接确认消息
    socket.on('connection', (data) => {
      console.log('连接确认:', data.message)
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

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinVotingRoom,
    leaveVotingRoom,
    onVoteUpdate,
    onSystemStatusUpdate,
    offVoteUpdate,
    offSystemStatusUpdate,
  }
}
