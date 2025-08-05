import { NextApiRequest } from 'next'
import { Server } from 'socket.io'
import type { 
  NextApiResponseWithSocket, 
  ServerToClientEvents, 
  ClientToServerEvents,
  SocketClient 
} from '@/lib/socket/types'

// 全局客户端管理
const clients = new Map<string, SocketClient>()

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket.IO 已经初始化')
    res.end()
    return
  }

  console.log('正在初始化 Socket.IO...')

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    res.socket.server,
    {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      // 传输配置 - 混合模式（推荐）
      transports: ['websocket', 'polling'],
      // 升级配置
      allowUpgrades: true,
      // 连接超时
      pingTimeout: 60000,
      pingInterval: 25000,
      // 强制使用 WebSocket（可选）
      // forceNew: true,
      // 调试模式（开发环境）
      ...(process.env.NODE_ENV === 'development' && {
        serveClient: true,
        allowEIO3: true
      })
    }
  )

  res.socket.server.io = io
  global.io = io

  // Socket 连接处理
  io.on('connection', (socket) => {
    console.log(`新的Socket.IO连接: ${socket.id}`)
    
    // 初始化客户端信息
    const client: SocketClient = {
      rooms: new Set()
    }
    clients.set(socket.id, client)

    // 发送连接确认消息
    socket.emit('connection', { message: '连接已建立' })

    // 处理用户认证
    socket.on('auth', (data) => {
      const client = clients.get(socket.id)
      if (client) {
        client.userId = data.userId
        client.isAdmin = data.isAdmin
        console.log(`用户认证: ${client.userId}, 管理员: ${client.isAdmin}`)
      }
    })

    // 处理加入房间
    socket.on('join-room', (data) => {
      const client = clients.get(socket.id)
      if (client) {
        socket.join(data.room)
        client.rooms.add(data.room)
        console.log(`用户 ${client.userId || socket.id} 加入房间: ${data.room}`)
        
        socket.emit('notification', {
          type: 'success',
          message: `已加入房间: ${data.room}`
        })
      }
    })

    // 处理离开房间
    socket.on('leave-room', (data) => {
      const client = clients.get(socket.id)
      if (client) {
        socket.leave(data.room)
        client.rooms.delete(data.room)
        console.log(`用户 ${client.userId || socket.id} 离开房间: ${data.room}`)
        
        socket.emit('notification', {
          type: 'info',
          message: `已离开房间: ${data.room}`
        })
      }
    })

    // 兼容旧的投票房间事件
    socket.on('join-voting', () => {
      socket.join('voting-room')
      const client = clients.get(socket.id)
      if (client) {
        client.rooms.add('voting-room')
      }
      console.log(`用户 ${socket.id} 加入投票房间`)
      
      socket.emit('notification', {
        type: 'success',
        message: '已加入投票房间'
      })
    })

    socket.on('leave-voting', () => {
      socket.leave('voting-room')
      const client = clients.get(socket.id)
      if (client) {
        client.rooms.delete('voting-room')
      }
      console.log(`用户 ${socket.id} 离开投票房间`)
      
      socket.emit('notification', {
        type: 'info',
        message: '已离开投票房间'
      })
    })

    // 处理ping/pong
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    // 处理断开连接
    socket.on('disconnect', () => {
      console.log(`Socket.IO连接断开: ${socket.id}`)
      clients.delete(socket.id)
    })
  })

  console.log('Socket.IO服务器已启动')
  res.end()
}

export default SocketHandler

// 导出广播函数供其他 API 使用
export function getSocketIO() {
  // 这个函数需要在服务器初始化后调用
  return global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
}

export function broadcastVoteUpdate(data: {
  projectId: string
  projectTitle: string
  newVoteCount: number
  voterName: string
}) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    io.to('voting-room').emit('vote-update', data)
    const roomSize = io.sockets.adapter.rooms.get('voting-room')?.size || 0
    console.log(`广播投票更新给 ${roomSize} 个客户端:`, data)
    return roomSize
  }
  return 0
}

export function broadcastSystemStatusUpdate(data: {
  isVotingEnabled: boolean
  maxVotesPerUser: number
}) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    io.to('voting-room').emit('system-status-update', data)
    const roomSize = io.sockets.adapter.rooms.get('voting-room')?.size || 0
    console.log(`广播系统状态更新给 ${roomSize} 个客户端:`, data)
    return roomSize
  }
  return 0
}

export function broadcastMessage(event: string, data: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    let sentCount = 0
    clients.forEach((client, socketId) => {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit(event as any, data)
        sentCount++
      }
    })
    console.log(`广播消息 "${event}" 给 ${sentCount} 个客户端:`, data)
    return sentCount
  }
  return 0
}

export function broadcastToRoom(room: string, event: string, data: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    io.to(room).emit(event as any, data)
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0
    console.log(`广播消息 "${event}" 给房间 "${room}" 的 ${roomSize} 个客户端:`, data)
    return roomSize
  }
  return 0
}

export function broadcastToUsers(event: string, data: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    let sentCount = 0
    clients.forEach((client, socketId) => {
      if (!client.isAdmin) {
        const socket = io.sockets.sockets.get(socketId)
        if (socket) {
          socket.emit(event as any, data)
          sentCount++
        }
      }
    })
    console.log(`广播消息 "${event}" 给 ${sentCount} 个用户客户端:`, data)
    return sentCount
  }
  return 0
}

export function broadcastToAdmins(event: string, data: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (io) {
    let sentCount = 0
    clients.forEach((client, socketId) => {
      if (client.isAdmin) {
        const socket = io.sockets.sockets.get(socketId)
        if (socket) {
          socket.emit(event as any, data)
          sentCount++
        }
      }
    })
    console.log(`广播消息 "${event}" 给 ${sentCount} 个管理员客户端:`, data)
    return sentCount
  }
  return 0
}

export function getStats() {
  const totalClients = clients.size
  let userClients = 0
  let adminClients = 0
  
  clients.forEach((client) => {
    if (client.isAdmin) {
      adminClients++
    } else if (client.userId) {
      userClients++
    }
  })

  return {
    total: totalClients,
    users: userClients,
    admins: adminClients,
    anonymous: totalClients - userClients - adminClients
  }
}

// 将 io 实例存储到全局变量中，以便其他模块访问
declare global {
  var io: Server<ClientToServerEvents, ServerToClientEvents> | undefined
}
