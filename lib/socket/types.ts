import { NextApiResponse } from 'next'
import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'

// 扩展 NextApiResponse 类型
export interface SocketServer extends HTTPServer {
  io?: Server | undefined
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

// 定义投票系统的事件类型
export interface ServerToClientEvents {
  // 连接确认
  connection: (data: { message: string }) => void
  
  // 投票更新事件
  'vote-update': (data: {
    projectId: string
    projectTitle: string
    newVoteCount: number
    voterName: string
  }) => void
  
  // 系统状态更新事件
  'system-status-update': (data: {
    isVotingEnabled: boolean
    maxVotesPerUser: number
  }) => void
  
  // 通用通知
  notification: (data: {
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }) => void
  
  // 心跳包
  pong: (data: { timestamp: number }) => void
  
  // 自定义消息
  [key: string]: (...args: any[]) => void
}

export interface ClientToServerEvents {
  // 用户认证
  auth: (data: { userId?: string; isAdmin?: boolean }) => void
  
  // 房间管理
  'join-room': (data: { room: string }) => void
  'leave-room': (data: { room: string }) => void
  
  // 兼容旧的投票房间事件
  'join-voting': () => void
  'leave-voting': () => void
  
  // 心跳包
  ping: () => void
  
  // 自定义消息
  [key: string]: (...args: any[]) => void
}

// Socket.IO 客户端信息接口
export interface SocketClient {
  userId?: string
  isAdmin?: boolean
  rooms: Set<string>
}
