import { create } from 'zustand'
import { Vote, VoteStats, LoadingState } from './types'
import { toast } from 'sonner'

interface VoteStore {
  // State
  votes: Vote[]
  loading: LoadingState
  searchTerm: string
  
  // Actions
  setVotes: (votes: Vote[]) => void
  setLoading: (key: string, loading: boolean) => void
  setSearchTerm: (term: string) => void
  
  // API Actions
  fetchVotes: () => Promise<void>
  deleteVote: (voteId: string) => Promise<boolean>
  
  // Computed
  stats: () => VoteStats
  filteredVotes: () => Vote[]
  refreshData: () => Promise<void>
}

export const useVoteStore = create<VoteStore>((set, get) => ({
  // Initial state
  votes: [],
  loading: {},
  searchTerm: '',
  
  // Basic actions
  setVotes: (votes) => set({ votes }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  // API actions
  fetchVotes: async () => {
    const { setLoading, setVotes, loading } = get()
    
    // Prevent duplicate requests
    if (loading.fetchVotes) {
      return
    }
    
    try {
      setLoading('fetchVotes', true)
      const response = await fetch('/api/admin/votes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch votes')
      }
      
      const votes = await response.json()
      setVotes(votes)
      
    } catch (error) {
      console.error('获取投票列表失败:', error)
      toast.error('获取投票列表失败')
    } finally {
      setLoading('fetchVotes', false)
    }
  },
  
  
  deleteVote: async (voteId) => {
    const { setLoading, votes, setVotes } = get()
    
    try {
      setLoading(`deleteVote_${voteId}`, true)
      
      const response = await fetch(`/api/admin/votes/${voteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete vote')
      }
      
      // Update local state - stats will be automatically recalculated
      const updatedVotes = votes.filter(vote => vote.id !== voteId)
      setVotes(updatedVotes)
      
      toast.success('投票记录已删除')
      return true
      
    } catch (error) {
      console.error('删除投票失败:', error)
      toast.error('删除投票失败')
      return false
    } finally {
      setLoading(`deleteVote_${voteId}`, false)
    }
  },
  
  // Computed values
  stats: () => {
    const { votes } = get()
    
    // Calculate stats
    const today = new Date().toDateString()
    const todayVotes = votes.filter((v: Vote) => 
      new Date(v.createdAt).toDateString() === today
    ).length
    
    const uniqueProjects = new Set(votes.map((v: Vote) => v.projectId))
    const averageVotesPerProject = uniqueProjects.size > 0 
      ? Math.round(votes.length / uniqueProjects.size * 10) / 10 
      : 0
    
    return {
      total: votes.length,
      todayVotes,
      averageVotesPerProject
    }
  },
  
  filteredVotes: () => {
    const { votes, searchTerm } = get()
    
    if (!searchTerm) return votes
    
    const term = searchTerm.toLowerCase()
    return votes.filter(vote =>
      vote.userName.toLowerCase().includes(term) ||
      vote.projectTitle.toLowerCase().includes(term) ||
      vote.reason.toLowerCase().includes(term)
    )
  },
  
  refreshData: async () => {
    await get().fetchVotes()
  }
}))