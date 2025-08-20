import { create } from 'zustand';
import { api } from '@/lib/api';
import { Vote, LoadingState } from './types';

interface VoteStats {
  total: number;
  today: number;
  valid: number;
  suspicious: number;
  avgScore: number;
  participationRate: number;
}

interface VoteStore {
  // State
  votes: Vote[];
  loading: LoadingState;
  searchTerm: string;
  statusFilter: string | null;
  
  // Actions
  setVotes: (votes: Vote[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string | null) => void;
  
  // API Actions
  fetchVotes: () => Promise<void>;
  deleteVote: (voteId: string) => Promise<boolean>;
  markVoteAsValid: (voteId: string) => Promise<boolean>;
  
  // Computed
  stats: () => VoteStats;
  filteredVotes: () => Vote[];
  refreshData: () => Promise<void>;
}

export const useAdminVoteStore = create<VoteStore>((set, get) => ({
  // Initial state
  votes: [],
  loading: {},
  searchTerm: '',
  statusFilter: null,
  
  // Basic actions
  setVotes: (votes) => set({ votes }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  
  // API actions
  fetchVotes: async () => {
    const { setLoading, setVotes, loading } = get();
    
    if (loading.fetchVotes) {
      return;
    }
    
    try {
      setLoading('fetchVotes', true);
      const data = await api.get('/api/admin/votes');
      setVotes(data.votes || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading('fetchVotes', false);
    }
  },
  
  deleteVote: async (voteId: string) => {
    const { setLoading, votes, setVotes } = get();
    
    try {
      setLoading('deleteVote', true);
      
      await api.delete(`/api/admin/votes/${voteId}`);
      
      // Update local state
      const updatedVotes = votes.filter(vote => vote.id !== voteId);
      setVotes(updatedVotes);
      
      return true;
    } catch (error) {
      console.error('Error deleting vote:', error);
      return false;
    } finally {
      setLoading('deleteVote', false);
    }
  },
  
  markVoteAsValid: async (voteId: string) => {
    const { setLoading } = get();
    
    try {
      setLoading('markValid', true);
      
      await api.patch(`/api/admin/votes/${voteId}`, {
        status: 'valid'
      });
      
      // Refresh data to get updated status
      await get().fetchVotes();
      
      return true;
    } catch (error) {
      console.error('Error marking vote as valid:', error);
      return false;
    } finally {
      setLoading('markValid', false);
    }
  },
  
  // Computed properties
  stats: () => {
    const { votes } = get();
    const total = votes.length;
    const today = votes.filter(v => {
      const voteDate = new Date(v.createdAt);
      const today = new Date();
      return voteDate.toDateString() === today.toDateString();
    }).length;
    
    // 模拟可疑投票检测逻辑
    const suspicious = Math.floor(total * 0.05); // 假设5%的投票可疑
    const valid = total - suspicious;
    const avgScore = 4.1; // 模拟平均分
    const participationRate = 78.5; // 模拟参与率
    
    return {
      total,
      today,
      valid,
      suspicious,
      avgScore,
      participationRate,
    };
  },
  
  filteredVotes: () => {
    const { votes, searchTerm, statusFilter } = get();
    
    return votes.filter(vote => {
      const matchesSearch = !searchTerm || 
        vote.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter ||
        (statusFilter === 'valid') ||
        (statusFilter === 'suspicious');
      
      return matchesSearch && matchesStatus;
    });
  },
  
  refreshData: async () => {
    await get().fetchVotes();
  },
}));
