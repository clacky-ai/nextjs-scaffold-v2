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
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
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
    console.log(`✅ 新的Socket.IO连接: ${socket.id} 来自: ${socket.handshake.address}`)
    
    // 初始化客户端信息
    const client: SocketClient = {
      rooms: new Set(),
      connectedAt: new Date(),
      lastActive: new Date()
    }
    clients.set(socket.id, client)

    // 发送连接确认消息
    socket.emit('connection', { message: '连接已建立' })

    // 处理用户认证
    socket.on('auth', (data) => {
      console.log(`🔐 收到认证请求:`, data)
      const client = clients.get(socket.id)
      if (client) {
        client.userId = data.userId
        client.userName = data.userName
        client.userEmail = data.userEmail
        client.isAdmin = data.isAdmin
        client.lastActive = new Date()
        console.log(`✅ 用户认证成功: ${client.userId} (${client.userName}), 管理员: ${client.isAdmin}`)
        
        // 向客户端发送认证确认
        socket.emit('auth-success', {
          userId: client.userId,
          userName: client.userName,
          isAdmin: client.isAdmin,
          timestamp: Date.now()
        })
        
        // 通知所有管理员在线用户更新
        broadcastOnlineUsersToAdmins()
      } else {
        console.error('❌ 认证失败: 找不到客户端信息', socket.id)
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

    // 获取在线用户
    socket.on('get-online-users', () => {
      const client = clients.get(socket.id)
      if (client?.isAdmin) {
        const onlineUsers = getOnlineUsersData()
        socket.emit('online-users-update', onlineUsers)
      }
    })

    // 管理员发送消息
    socket.on('admin-send-message', (data) => {
      const client = clients.get(socket.id)
      if (client?.isAdmin && client.userName) {
        const messageData = {
          id: `msg_${Date.now()}_${socket.id}`,
          title: data.title,
          message: data.message,
          type: data.type,
          from: client.userName,
          timestamp: Date.now()
        }

        if (data.targetUserId) {
          // 发送给特定用户
          sendMessageToUser(data.targetUserId, messageData)
        } else {
          // 发送给所有在线用户
          broadcastMessageToUsers(messageData)
        }
        
        console.log(`管理员 ${client.userName} 发送消息:`, messageData)
      }
    })

    // 处理ping/pong
    socket.on('ping', () => {
      const client = clients.get(socket.id)
      if (client) {
        client.lastActive = new Date()
      }
      socket.emit('pong', { timestamp: Date.now() })
    })

    // 处理断开连接
    socket.on('disconnect', () => {
      console.log(`Socket.IO连接断开: ${socket.id}`)
      clients.delete(socket.id)
      
      // 通知所有管理员在线用户更新
      broadcastOnlineUsersToAdmins()
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

// 获取在线用户数据
export function getOnlineUsersData() {
  const onlineUsers: Array<{
    id: string
    socketId: string
    name: string
    email: string
    connectedAt: number
    lastActive: number
  }> = []

  clients.forEach((client, socketId) => {
    if (!client.isAdmin && client.userId && client.userName) {
      onlineUsers.push({
        id: client.userId,
        socketId: socketId,
        name: client.userName,
        email: client.userEmail || '',
        connectedAt: client.connectedAt.getTime(),
        lastActive: client.lastActive.getTime()
      })
    }
  })

  return {
    count: onlineUsers.length,
    users: onlineUsers
  }
}

// 向所有管理员广播在线用户更新
export function broadcastOnlineUsersToAdmins() {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (!io) return 0

  const onlineUsers = getOnlineUsersData()
  let sentCount = 0
  
  clients.forEach((client, socketId) => {
    if (client.isAdmin) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('online-users-update', onlineUsers)
        sentCount++
      }
    }
  })

  console.log(`广播在线用户更新给 ${sentCount} 个管理员:`, onlineUsers)
  return sentCount
}

// 发送消息给特定用户
export function sendMessageToUser(userId: string, messageData: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (!io) return false

  let sent = false
  clients.forEach((client, socketId) => {
    if (client.userId === userId && !client.isAdmin) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('admin-message', messageData)
        sent = true
        console.log(`发送消息给用户 ${userId}:`, messageData)
      }
    }
  })

  return sent
}

// 向所有在线用户广播消息
export function broadcastMessageToUsers(messageData: any) {
  const io = global.io as Server<ClientToServerEvents, ServerToClientEvents> | undefined
  if (!io) return 0

  let sentCount = 0
  clients.forEach((client, socketId) => {
    if (!client.isAdmin && client.userId) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('admin-message', messageData)
        sentCount++
      }
    }
  })

  console.log(`广播消息给 ${sentCount} 个在线用户:`, messageData)
  return sentCount
}

// 将 io 实例存储到全局变量中，以便其他模块访问
declare global {
  var io: Server<ClientToServerEvents, ServerToClientEvents> | undefined
}
