import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface VoteStats {
  userId: string;
  votesUsed: number;
  maxVotes: number;
  lastVoteAt?: string;
}

export interface VoteData {
  projectId: string;
  innovationScore: number;
  technicalScore: number;
  practicalityScore: number;
  presentationScore: number;
  teamworkScore: number;
  comment: string;
}

export interface Vote {
  id: string;
  userId: string;
  projectId: string;
  innovationScore: number;
  technicalScore: number;
  practicalityScore: number;
  presentationScore: number;
  teamworkScore: number;
  totalScore: number;
  comment: string;
  votedAt: string;
}

export interface ProjectVoteResult {
  totalVotes: number;
  averageScores: {
    innovation: number;
    technical: number;
    practicality: number;
    presentation: number;
    teamwork: number;
    total: number;
  };
  votes: Array<{
    id: string;
    comment: string;
    votedAt: string;
    scores: {
      innovation: number;
      technical: number;
      practicality: number;
      presentation: number;
      teamwork: number;
      total: number;
    };
  }>;
}

// 获取存储的token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// API调用函数
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || '请求失败');
  }

  return response.json();
}

// 获取用户投票统计
async function getVoteStats(): Promise<VoteStats> {
  return fetchWithAuth('/api/votes/stats');
}

// 检查是否已对项目投票
async function checkVote(projectId: string): Promise<{ hasVoted: boolean; vote?: Vote }> {
  return fetchWithAuth(`/api/votes/${projectId}/check`);
}

// 提交投票
async function submitVote(data: VoteData): Promise<{ message: string; vote: Vote }> {
  return fetchWithAuth('/api/votes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 获取项目投票结果
async function getProjectVotes(projectId: string): Promise<ProjectVoteResult> {
  return fetchWithAuth(`/api/projects/${projectId}/votes`);
}

export function useVotes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取用户投票统计
  const { data: voteStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['votes', 'stats'],
    queryFn: getVoteStats,
    staleTime: 1 * 60 * 1000, // 1分钟
  });

  // 提交投票mutation
  const submitVoteMutation = useMutation({
    mutationFn: submitVote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "投票成功",
        description: "您的投票已成功提交！",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "投票失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    voteStats,
    isStatsLoading,
    submitVote: submitVoteMutation.mutate,
    isSubmittingVote: submitVoteMutation.isPending,
    remainingVotes: voteStats ? voteStats.maxVotes - voteStats.votesUsed : 3,
  };
}

// 检查项目投票状态的Hook
export function useProjectVoteCheck(projectId: string) {
  return useQuery({
    queryKey: ['votes', 'check', projectId],
    queryFn: () => checkVote(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30秒
  });
}

// 获取项目投票结果的Hook
export function useProjectVotes(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'votes'],
    queryFn: () => getProjectVotes(projectId),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}
