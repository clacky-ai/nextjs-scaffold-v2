import { create } from 'zustand';
import { api, authApi, API_ENDPOINTS } from '@/lib/api';

export interface ScoreDimension {
  id: string;
  name: string;
  description?: string;
  maxScore: number;
  weight: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  voterId: string;
  projectId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  voteId: string;
  dimensionId: string;
  score: number;
  createdAt: string;
}

export interface VoteWithScores {
  vote: Vote;
  scores: Score[];
}

export interface VoteStats {
  totalVotes: number;
  remainingVotes: number;
  maxVotes: number;
}

export interface CanVoteResult {
  canVote: boolean;
  reason?: string;
}

export interface VotingResults {
  projects: Array<{
    project: any; // 使用项目类型
    totalVotes: number;
    averageScore: number;
    averageScores: Record<string, number>;
    rank: number;
  }>;
  totalVotes: number;
  totalProjects: number;
}

interface VoteFormData {
  projectId: string;
  scores: Record<string, number>;
  comment: string;
}

interface VotingState {
  // State
  dimensions: ScoreDimension[];
  userStats: VoteStats | null;
  userVotes: VoteWithScores[];
  votingResults: VotingResults | null;
  isLoading: boolean;
  error: string | null;
  
  // Current voting
  currentProjectId: string | null;
  currentScores: Record<string, number>;
  currentComment: string;
  
  // Actions
  setDimensions: (dimensions: ScoreDimension[]) => void;
  setUserStats: (stats: VoteStats | null) => void;
  setUserVotes: (votes: VoteWithScores[]) => void;
  setVotingResults: (results: VotingResults | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentProjectId: (projectId: string | null) => void;
  setCurrentScores: (scores: Record<string, number>) => void;
  setCurrentComment: (comment: string) => void;
  
  // API Actions
  fetchDimensions: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchUserVotes: () => Promise<void>;
  fetchVotingResults: () => Promise<void>;
  checkCanVote: (projectId: string) => Promise<CanVoteResult>;
  submitVote: (voteData: VoteFormData) => Promise<void>;
  clearError: () => void;
  resetVoteForm: () => void;
}



export const useVotingStore = create<VotingState>((set, get) => ({
  // Initial state
  dimensions: [],
  userStats: null,
  userVotes: [],
  votingResults: null,
  isLoading: false,
  error: null,
  
  // Current voting
  currentProjectId: null,
  currentScores: {},
  currentComment: '',
  
  // Actions
  setDimensions: (dimensions) => set({ dimensions }),
  setUserStats: (userStats) => set({ userStats }),
  setUserVotes: (userVotes) => set({ userVotes }),
  setVotingResults: (votingResults) => set({ votingResults }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setCurrentScores: (currentScores) => set({ currentScores }),
  setCurrentComment: (currentComment) => set({ currentComment }),
  clearError: () => set({ error: null }),
  
  resetVoteForm: () => set({
    currentProjectId: null,
    currentScores: {},
    currentComment: '',
  }),
  
  // API Actions
  fetchDimensions: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get(API_ENDPOINTS.SCORE_DIMENSIONS.LIST);

      set({
        dimensions: response.dimensions,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取评分维度失败',
      });
    }
  },
  
  fetchUserStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await authApi.get(API_ENDPOINTS.VOTES.STATS);

      set({
        userStats: response,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取投票统计失败',
      });
    }
  },
  
  fetchUserVotes: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await authApi.get(API_ENDPOINTS.VOTES.MY_VOTES);

      set({
        userVotes: response.votes,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取投票历史失败',
      });
    }
  },
  
  fetchVotingResults: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get(API_ENDPOINTS.VOTES.RESULTS);

      set({
        votingResults: response,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取投票结果失败',
      });
    }
  },
  
  checkCanVote: async (projectId: string) => {
    try {
      const response = await authApi.get(API_ENDPOINTS.PROJECTS.CAN_VOTE(projectId));
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  submitVote: async (voteData: VoteFormData) => {
    try {
      set({ isLoading: true, error: null });

      // 转换评分数据格式
      const scores = Object.entries(voteData.scores).map(([dimensionId, score]) => ({
        dimensionId,
        score,
      }));

      await authApi.post(API_ENDPOINTS.VOTES.SUBMIT, {
        projectId: voteData.projectId,
        scores,
        comment: voteData.comment,
      });

      // 重新获取用户统计和投票历史
      await get().fetchUserStats();
      await get().fetchUserVotes();

      // 重置表单
      get().resetVoteForm();

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '提交投票失败',
      });
      throw error;
    }
  },
}));

// 便捷的 hooks
export const useDimensions = () => useVotingStore((state) => state.dimensions);
export const useUserStats = () => useVotingStore((state) => state.userStats);
export const useUserVotes = () => useVotingStore((state) => state.userVotes);
export const useVotingResults = () => useVotingStore((state) => state.votingResults);
export const useVotingLoading = () => useVotingStore((state) => state.isLoading);
export const useVotingError = () => useVotingStore((state) => state.error);
