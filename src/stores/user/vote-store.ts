import { create } from 'zustand'
import { Vote, VoteStats, LoadingState } from './types'
import { toast } from 'sonner'

interface VoteStore {
  // State
  votes: Vote[]
  userVotes: string[] // projectIds that user has voted for
  loading: LoadingState
  
  // Actions
  setVotes: (votes: Vote[]) => void
  setUserVotes: (userVotes: string[]) => void
  setLoading: (key: string, loading: boolean) => void
  
  // API Actions
  fetchUserVotes: () => Promise<void>
  submitVote: (projectId: string, reason: string) => Promise<boolean>
  
  // Vote validation
  canVote: (projectId: string, userId?: string, maxVotes?: number, teamMembers?: string[], submitterId?: string) => boolean
  getVoteButtonText: (projectId: string, userId?: string, maxVotes?: number, teamMembers?: string[], submitterId?: string, isVotingEnabled?: boolean) => string
  
  // Computed
  stats: (maxVotes?: number) => VoteStats
  refreshData: () => Promise<void>
}

export const useVoteStore = create<VoteStore>((set, get) => ({
  // Initial state
  votes: [],
  userVotes: [],
  loading: {},
  
  // Basic actions
  setVotes: (votes) => set({ votes }),
  setUserVotes: (userVotes) => set({ userVotes }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  
  // API Actions
  fetchUserVotes: async () => {
    const { setLoading, setVotes, setUserVotes } = get()
    
    try {
      setLoading('fetchUserVotes', true)
      
      const response = await fetch('/api/votes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user votes')
      }
      
      const data = await response.json()
      setVotes(data)
      
      // Extract project IDs that user has voted for
      const votedProjectIds = data.map((vote: Vote) => vote.projectId)
      setUserVotes(votedProjectIds)
      
    } catch (error) {
      console.error('获取投票记录失败:', error)
      // Don't show error toast for votes as it's not critical
    } finally {
      setLoading('fetchUserVotes', false)
    }
  },
  
  submitVote: async (projectId, reason) => {
    const { setLoading, userVotes, setUserVotes, fetchUserVotes } = get()
    
    if (!reason.trim()) {
      toast.error('请填写投票理由')
      return false
    }
    
    try {
      setLoading(`submitVote_${projectId}`, true)
      
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          reason,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote')
      }
      
      toast.success('投票成功！')
      
      // Update local state immediately
      setUserVotes([...userVotes, projectId])
      
      // Refresh vote data
      await fetchUserVotes()
      
      return true
      
    } catch (error: any) {
      console.error('投票失败:', error)
      toast.error(error.message || '投票失败')
      return false
    } finally {
      setLoading(`submitVote_${projectId}`, false)
    }
  },
  
  // Vote validation
  canVote: (projectId, userId, maxVotes = 3, teamMembers = [], submitterId) => {
    const { userVotes } = get()
    
    // Check if already voted for this project
    if (userVotes.includes(projectId)) return false
    
    // Check if reached max votes
    if (userVotes.length >= maxVotes) return false
    
    // Check if it's user's own project
    if (userId && (submitterId === userId || teamMembers.includes(userId))) return false
    
    return true
  },
  
  getVoteButtonText: (projectId, userId, maxVotes = 3, teamMembers = [], submitterId, isVotingEnabled = true) => {
    const { userVotes } = get()
    
    if (!isVotingEnabled) return '投票已暂停'
    if (userVotes.includes(projectId)) return '已投票'
    if (userVotes.length >= maxVotes) return '投票已用完'
    
    if (userId && (submitterId === userId || teamMembers.includes(userId))) {
      return '不能给自己投票'
    }
    
    return '投票'
  },
  
  // Computed values
  stats: (maxVotes = 3) => {
    const { votes, userVotes } = get()
    
    return {
      totalVotes: votes.length,
      remainingVotes: Math.max(0, maxVotes - userVotes.length),
      myVotes: userVotes.length
    }
  },
  
  refreshData: async () => {
    await get().fetchUserVotes()
  }
}))
