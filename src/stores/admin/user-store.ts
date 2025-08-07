import { create } from 'zustand'
import { User, UserStats, LoadingState } from './types'
import { toast } from 'sonner'

interface UserStore {
  // State
  users: User[]
  loading: LoadingState
  searchTerm: string
  
  // Actions
  setUsers: (users: User[]) => void
  setLoading: (key: string, loading: boolean) => void
  setSearchTerm: (term: string) => void
  
  // API Actions
  fetchUsers: () => Promise<void>
  toggleUserStatus: (userId: string, isBlocked: boolean) => Promise<boolean>
  
  // Computed
  stats: () => UserStats
  filteredUsers: () => User[]
  refreshData: () => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  loading: {},
  searchTerm: '',
  
  // Basic actions
  setUsers: (users) => set({ users }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  // API actions
  fetchUsers: async () => {
    const { setLoading, setUsers, loading } = get()
    
    // Prevent duplicate requests
    if (loading.fetchUsers) {
      return
    }
    
    try {
      setLoading('fetchUsers', true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const users = await response.json()
      setUsers(users)
      
    } catch (error) {
      console.error('获取用户列表失败:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading('fetchUsers', false)
    }
  },
  
  
  toggleUserStatus: async (userId, isBlocked) => {
    const { setLoading, users, setUsers } = get()
    
    try {
      setLoading(`toggleUser_${userId}`, true)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user status')
      }
      
      // Update local state - stats will be automatically recalculated
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, isBlocked: !isBlocked } : user
      )
      setUsers(updatedUsers)
      
      toast.success(
        !isBlocked ? '用户已被屏蔽' : '用户屏蔽已解除'
      )
      
      return true
      
    } catch (error) {
      console.error('更新用户状态失败:', error)
      toast.error('更新用户状态失败')
      return false
    } finally {
      setLoading(`toggleUser_${userId}`, false)
    }
  },
  
  // Computed values
  stats: () => {
    const { users } = get()
    return {
      total: users.length,
      active: users.filter(u => !u.isBlocked).length,
      blocked: users.filter(u => u.isBlocked).length
    }
  },
  
  filteredUsers: () => {
    const { users, searchTerm } = get()
    
    if (!searchTerm) return users
    
    const term = searchTerm.toLowerCase()
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.team && user.team.toLowerCase().includes(term))
    )
  },
  
  refreshData: async () => {
    await get().fetchUsers()
  }
}))