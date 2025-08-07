import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import type { 
  WebSocketConnectionState, 
  VoteUpdateData, 
  SystemStatusUpdateData,
  OnlineUser,
  LoadingState 
} from './types'

interface AdminWebSocketStore {
  // Connection State
  connection: WebSocketConnectionState
  socket: Socket | null
  
  // Real-time Data
  onlineUsers: OnlineUser[]
  onlineUserCount: number
  
  // Message State
  loading: LoadingState
  
  // Connection Actions
  connect: () => void
  disconnect: () => void
  authenticate: (userData: { 
    userId?: string
    userName?: string
    userEmail?: string
    isAdmin?: boolean 
  }) => void
  
  // Real-time Updates
  updateOnlineUsers: (users: OnlineUser[]) => void
  setOnlineUserCount: (count: number) => void
  
  // Messaging Actions
  sendMessageToUser: (data: {
    targetUserId: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
  }) => Promise<boolean>
  
  sendBroadcastMessage: (data: {
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
  }) => Promise<boolean>
  
  // Event Handlers
  onVoteUpdate: (callback: (data: VoteUpdateData) => void) => void
  onSystemStatusUpdate: (callback: (data: SystemStatusUpdateData) => void) => void
  offVoteUpdate: () => void
  offSystemStatusUpdate: () => void
  
  // Utility
  setLoading: (key: string, loading: boolean) => void
  isUserOnline: (userId: string) => boolean
  getActiveUsers: () => OnlineUser[]
}

export const useAdminWebSocketStore = create<AdminWebSocketStore>((set, get) => {
  let voteUpdateCallback: ((data: VoteUpdateData) => void) | null = null
  let systemStatusCallback: ((data: SystemStatusUpdateData) => void) | null = null
  
  const getSocketUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001'
    return window.location.origin
  }

  return {
    // Initial state
    connection: {
      isConnected: false,
      isAuthenticated: false,
      reconnectAttempts: 0
    },
    socket: null,
    onlineUsers: [],
    onlineUserCount: 0,
    loading: {},
    
    // Connection actions
    connect: () => {
      const { socket, connection } = get()
      
      // Don't create multiple connections
      if (socket && connection.isConnected) {
        return
      }
      
      // Create new socket connection
      const newSocket = io(getSocketUrl(), {
        path: '/api/socket',
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        transports: ['polling', 'websocket'],
        upgrade: true,
        timeout: 20000,
        forceNew: false
      })
      
      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ WebSocket连接已建立:', newSocket.id)
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: true,
            reconnectAttempts: 0,
            lastConnectedAt: new Date()
          }
        }))
      })
      
      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket连接断开')
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: false,
            isAuthenticated: false
          }
        }))
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket连接错误:', error)
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: false,
            reconnectAttempts: state.connection.reconnectAttempts + 1
          }
        }))
      })
      
      // Authentication success
      newSocket.on('auth-success', (data) => {
        console.log('🎉 认证成功:', data)
        set((state) => ({
          connection: {
            ...state.connection,
            isAuthenticated: true
          }
        }))
      })
      
      // Real-time events
      newSocket.on('online-users-update', (data: { 
        count: number; 
        users: Array<{
          id: string
          socketId: string
          name: string
          email: string
          connectedAt: number
          lastActive: number
        }>
      }) => {
        // Transform server data format to our expected format
        const transformedUsers: OnlineUser[] = data.users.map(user => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          socketId: user.socketId,
          connectedAt: new Date(user.connectedAt).toISOString(),
          lastActivity: new Date(user.lastActive).toISOString(),
          isActive: (Date.now() - user.lastActive) < 30000 // Active if last activity within 30 seconds
        }))
        
        get().updateOnlineUsers(transformedUsers)
        get().setOnlineUserCount(data.count)
      })
      

      newSocket.on('system-status-update', (data: SystemStatusUpdateData) => {
        console.log('收到系统状态更新:', data)
        if (systemStatusCallback) {
          systemStatusCallback(data)
        }
      })
      
      set({ socket: newSocket })
    },
    
    disconnect: () => {
      const { socket } = get()
      if (socket) {
        socket.disconnect()
        set({ 
          socket: null,
          connection: {
            isConnected: false,
            isAuthenticated: false,
            reconnectAttempts: 0
          }
        })
      }
    },
    
    authenticate: (userData) => {
      const { socket } = get()
      if (socket && socket.connected) {
        socket.emit('auth', userData)
        console.log('发送认证信息:', userData)
      }
    },
    
    // Real-time updates
    updateOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    setOnlineUserCount: (onlineUserCount) => set({ onlineUserCount }),
    
    // Messaging actions
    sendMessageToUser: async (data) => {
      const { socket, setLoading } = get()
      
      if (!socket || !socket.connected) {
        toast.error('WebSocket连接未建立')
        return false
      }
      
      try {
        setLoading(`sendMessage_${data.targetUserId}`, true)
        
        return new Promise((resolve) => {
          socket.emit('admin-send-message', {
            targetUserId: data.targetUserId,
            title: data.title,
            message: data.message,
            type: data.type
          })
          
          // 简单的成功反馈
          setTimeout(() => {
            toast.success('消息已发送')
            resolve(true)
          }, 500)
        })
        
      } catch (error) {
        console.error('发送消息失败:', error)
        toast.error('发送消息失败')
        return false
      } finally {
        setLoading(`sendMessage_${data.targetUserId}`, false)
      }
    },
    
    sendBroadcastMessage: async (data) => {
      const { socket, setLoading } = get()
      
      if (!socket || !socket.connected) {
        toast.error('WebSocket连接未建立')
        return false
      }
      
      try {
        setLoading('broadcast', true)
        
        return new Promise((resolve) => {
          socket.emit('admin-send-message', {
            title: data.title,
            message: data.message,
            type: data.type
          })
          
          // 简单的成功反馈
          setTimeout(() => {
            toast.success('广播消息已发送')
            resolve(true)
          }, 500)
        })
        
      } catch (error) {
        console.error('发送广播消息失败:', error)
        toast.error('发送广播消息失败')
        return false
      } finally {
        setLoading('broadcast', false)
      }
    },
    
    // Event handlers
    onVoteUpdate: (callback) => {
      voteUpdateCallback = callback
    },
    
    onSystemStatusUpdate: (callback) => {
      systemStatusCallback = callback
    },
    
    offVoteUpdate: () => {
      voteUpdateCallback = null
    },
    
    offSystemStatusUpdate: () => {
      systemStatusCallback = null
    },
    
    // Utility
    setLoading: (key, loading) => set((state) => ({
      loading: { ...state.loading, [key]: loading }
    })),
    
    isUserOnline: (userId) => {
      return get().onlineUsers.some(user => user.userId === userId)
    },
    
    getActiveUsers: () => {
      return get().onlineUsers.filter(user => user.isActive)
    }
  }
})