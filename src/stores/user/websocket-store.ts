import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import type { 
  WebSocketConnectionState, 
  AdminMessageData, 
  VoteUpdateData, 
  SystemStatusUpdateData,
  LoadingState 
} from './types'

interface UserWebSocketStore {
  // Connection State
  connection: WebSocketConnectionState
  socket: Socket | null
  
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
  
  // Event Handlers
  onVoteUpdate: (callback: (data: VoteUpdateData) => void) => void
  onSystemStatusUpdate: (callback: (data: SystemStatusUpdateData) => void) => void
  onAdminMessage: (callback: (data: AdminMessageData) => void) => void
  offVoteUpdate: () => void
  offSystemStatusUpdate: () => void
  offAdminMessage: () => void
  
  // Room Management
  joinVotingRoom: () => void
  leaveVotingRoom: () => void
  
  // Utility
  setLoading: (key: string, loading: boolean) => void
}

export const useUserWebSocketStore = create<UserWebSocketStore>((set, get) => {
  let voteUpdateCallback: ((data: VoteUpdateData) => void) | null = null
  let systemStatusCallback: ((data: SystemStatusUpdateData) => void) | null = null
  let adminMessageCallback: ((data: AdminMessageData) => void) | null = null
  
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
        console.log('✅ 用户WebSocket连接已建立:', newSocket.id)
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
        console.log('❌ 用户WebSocket连接断开')
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: false,
            isAuthenticated: false
          }
        }))
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ 用户WebSocket连接错误:', error)
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
        console.log('🎉 用户认证成功:', data)
        set((state) => ({
          connection: {
            ...state.connection,
            isAuthenticated: true
          }
        }))
      })
      
      // Real-time events
      newSocket.on('vote-update', (data: VoteUpdateData) => {
        console.log('收到投票更新:', data)
        if (voteUpdateCallback) {
          voteUpdateCallback(data)
        }
      })
      
      newSocket.on('system-status-update', (data: SystemStatusUpdateData) => {
        console.log('收到系统状态更新:', data)
        if (systemStatusCallback) {
          systemStatusCallback(data)
        }
      })
      
      newSocket.on('admin-message', (data: AdminMessageData) => {
        console.log('收到管理员消息:', data)
        if (adminMessageCallback) {
          adminMessageCallback(data)
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
        console.log('发送用户认证信息:', userData)
      }
    },
    
    // Event handlers
    onVoteUpdate: (callback) => {
      voteUpdateCallback = callback
    },
    
    onSystemStatusUpdate: (callback) => {
      systemStatusCallback = callback
    },
    
    onAdminMessage: (callback) => {
      adminMessageCallback = callback
    },
    
    offVoteUpdate: () => {
      voteUpdateCallback = null
    },
    
    offSystemStatusUpdate: () => {
      systemStatusCallback = null
    },
    
    offAdminMessage: () => {
      adminMessageCallback = null
    },
    
    // Room management
    joinVotingRoom: () => {
      const { socket } = get()
      if (socket) {
        socket.emit('join-voting')
        socket.emit('join-room', { room: 'voting' })
        console.log('已加入投票房间')
      }
    },
    
    leaveVotingRoom: () => {
      const { socket } = get()
      if (socket) {
        socket.emit('leave-voting')
        socket.emit('leave-room', { room: 'voting' })
        console.log('已离开投票房间')
      }
    },
    
    // Utility
    setLoading: (key, loading) => set((state) => ({
      loading: { ...state.loading, [key]: loading }
    }))
  }
})