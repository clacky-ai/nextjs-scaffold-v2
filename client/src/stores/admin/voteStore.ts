import { create } from 'zustand';
import { api } from '@/lib/api';
import { Vote, VoteStats, LoadingState } from './types';

interface VoteStore {
  // State
  votes: Vote[];
  loading: LoadingState;
  searchTerm: string;
  
  // Actions
  setVotes: (votes: Vote[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  
  // API Actions
  fetchVotes: () => Promise<void>;
  deleteVote: (voteId: string) => Promise<boolean>;
  
  // Computed
  stats: () => VoteStats;
  filteredVotes: () => Vote[];
  refreshData: () => Promise<void>;
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
    const { setLoading, setVotes, loading } = get();
    
    // Prevent duplicate requests
    if (loading.fetchVotes) {
      return;
    }
    
    try {
      setLoading('fetchVotes', true);
      const data = await api.get('/api/admin/votes');
      setVotes(data.votes || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
      // You can add toast notification here if needed
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
  
  // Computed properties
  stats: () => {
    const { votes } = get();
    const total = votes.length;
    
    // Calculate today's votes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVotes = votes.filter(vote => {
      const voteDate = new Date(vote.createdAt);
      voteDate.setHours(0, 0, 0, 0);
      return voteDate.getTime() === today.getTime();
    }).length;
    
    // Calculate average votes per project
    const projectVoteCounts = votes.reduce((acc, vote) => {
      acc[vote.projectId] = (acc[vote.projectId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const projectCount = Object.keys(projectVoteCounts).length;
    const averageVotesPerProject = projectCount > 0 ? total / projectCount : 0;
    
    return { 
      total, 
      todayVotes, 
      averageVotesPerProject: Math.round(averageVotesPerProject * 100) / 100 
    };
  },
  
  filteredVotes: () => {
    const { votes, searchTerm } = get();
    
    if (!searchTerm) {
      return votes;
    }
    
    const term = searchTerm.toLowerCase();
    return votes.filter(vote => 
      vote.userName.toLowerCase().includes(term) ||
      vote.projectTitle.toLowerCase().includes(term) ||
      vote.reason.toLowerCase().includes(term)
    );
  },
  
  refreshData: async () => {
    const { fetchVotes } = get();
    await fetchVotes();
  }
}));
