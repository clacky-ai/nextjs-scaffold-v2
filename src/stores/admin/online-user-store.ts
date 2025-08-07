import { create } from 'zustand'
import { OnlineUser, LoadingState } from './types'
import { toast } from 'sonner'

interface OnlineUserStore {
  // State
  onlineUsers: OnlineUser[]
  loading: LoadingState
  searchTerm: string
  
  // Actions
  setOnlineUsers: (users: OnlineUser[]) => void
  setLoading: (key: string, loading: boolean) => void
  setSearchTerm: (term: string) => void
  
  // API Actions
  fetchOnlineUsers: () => Promise<void>
  sendMessageToUser: (userId: string, message: string) => Promise<boolean>
  sendBroadcastMessage: (message: string) => Promise<boolean>
  
  // Computed
  filteredOnlineUsers: () => OnlineUser[]
  totalOnlineUsers: () => number
  activeUsers: () => OnlineUser[]
  refreshData: () => Promise<void>
}

export const useOnlineUserStore = create<OnlineUserStore>((set, get) => ({
  // Initial state
  onlineUsers: [],
  loading: {},
  searchTerm: '',
  
  // Basic actions
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  // API actions (fallback for when WebSocket is not available)
  fetchOnlineUsers: async () => {
    const { setLoading, setOnlineUsers, loading } = get()
    
    // Prevent duplicate requests
    if (loading.fetchOnlineUsers) {
      return
    }
    
    try {
      setLoading('fetchOnlineUsers', true)
      const response = await fetch('/api/admin/online-users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch online users')
      }
      
      const users = await response.json()
      setOnlineUsers(users)
      
    } catch (error) {
      console.error('获取在线用户失败:', error)
      toast.error('获取在线用户失败')
    } finally {
      setLoading('fetchOnlineUsers', false)
    }
  },
  
  sendMessageToUser: async (userId, message) => {
    const { setLoading } = get()
    
    try {
      setLoading(`sendMessage_${userId}`, true)
      
      const response = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          userId,
          message,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      toast.success('消息已发送')
      return true
      
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送消息失败')
      return false
    } finally {
      setLoading(`sendMessage_${userId}`, false)
    }
  },
  
  sendBroadcastMessage: async (message) => {
    const { setLoading } = get()
    
    try {
      setLoading('broadcast', true)
      
      const response = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'broadcast',
          message,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send broadcast message')
      }
      
      toast.success('广播消息已发送')
      return true
      
    } catch (error) {
      console.error('发送广播消息失败:', error)
      toast.error('发送广播消息失败')
      return false
    } finally {
      setLoading('broadcast', false)
    }
  },
  
  // Computed values
  filteredOnlineUsers: () => {
    const { onlineUsers, searchTerm } = get()
    
    if (!searchTerm) return onlineUsers
    
    const term = searchTerm.toLowerCase()
    return onlineUsers.filter(user =>
      user.userName.toLowerCase().includes(term) ||
      user.userEmail.toLowerCase().includes(term)
    )
  },
  
  totalOnlineUsers: () => {
    return get().onlineUsers.length
  },
  
  activeUsers: () => {
    return get().onlineUsers.filter(user => user.isActive)
  },
  
  refreshData: async () => {
    await get().fetchOnlineUsers()
  }
}))