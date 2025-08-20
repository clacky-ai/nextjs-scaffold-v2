import { create } from 'zustand';
import { api } from '@/lib/api';
import { LoadingState } from './types';

interface ProjectRanking {
  id: string;
  rank: number;
  title: string;
  author: string;
  category: string;
  totalVotes: number;
  avgScore: number;
  scores: {
    innovation: number;
    technical: number;
    practical: number;
    presentation: number;
    impact: number;
  };
}

interface CategoryStats {
  category: string;
  projects: number;
  avgScore: number;
  totalVotes: number;
}

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalVotes: number;
  participationRate: number;
  activeUsers: number;
  pendingProjects: number;
  avgScore: number;
  completionRate: number;
}

interface StatisticsStore {
  // State
  dashboardStats: DashboardStats | null;
  projectRankings: ProjectRanking[];
  categoryStats: CategoryStats[];
  loading: LoadingState;
  
  // Actions
  setDashboardStats: (stats: DashboardStats) => void;
  setProjectRankings: (rankings: ProjectRanking[]) => void;
  setCategoryStats: (stats: CategoryStats[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  
  // API Actions
  fetchDashboardStats: () => Promise<void>;
  fetchProjectRankings: () => Promise<void>;
  fetchCategoryStats: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  // Initial state
  dashboardStats: null,
  projectRankings: [],
  categoryStats: [],
  loading: {},
  
  // Basic actions
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setProjectRankings: (projectRankings) => set({ projectRankings }),
  setCategoryStats: (categoryStats) => set({ categoryStats }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  
  // API actions
  fetchDashboardStats: async () => {
    const { setLoading, setDashboardStats, loading } = get();
    
    if (loading.fetchDashboardStats) {
      return;
    }
    
    try {
      setLoading('fetchDashboardStats', true);
      
      // 并行获取各种统计数据
      const [usersData, projectsData, votesData] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/projects'),
        api.get('/api/admin/votes'),
      ]);
      
      const users = usersData.users || [];
      const projects = projectsData.projects || [];
      const votes = votesData.votes || [];
      
      // 计算统计数据
      const totalUsers = users.length;
      const totalProjects = projects.length;
      const totalVotes = votes.length;
      const activeUsers = users.filter((u: any) => !u.isBlocked).length;
      const pendingProjects = projects.filter((p: any) => p.isBlocked).length;
      const participationRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
      const avgScore = 4.2; // 需要从实际评分数据计算
      const completionRate = 73; // 需要从实际数据计算
      
      const stats: DashboardStats = {
        totalUsers,
        totalProjects,
        totalVotes,
        participationRate: Number(participationRate.toFixed(1)),
        activeUsers,
        pendingProjects,
        avgScore,
        completionRate,
      };
      
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading('fetchDashboardStats', false);
    }
  },
  
  fetchProjectRankings: async () => {
    const { setLoading, setProjectRankings, loading } = get();
    
    if (loading.fetchProjectRankings) {
      return;
    }
    
    try {
      setLoading('fetchProjectRankings', true);
      
      // 获取投票结果数据
      const response = await api.get('/api/votes/results');
      
      if (response.projects) {
        const rankings: ProjectRanking[] = response.projects.map((item: any, index: number) => ({
          id: item.project.id,
          rank: index + 1,
          title: item.project.title,
          author: item.project.submitterName || '未知',
          category: item.project.categoryName || '其他',
          totalVotes: item.totalVotes,
          avgScore: item.averageScore,
          scores: {
            innovation: item.averageScores?.innovation || 0,
            technical: item.averageScores?.technical || 0,
            practical: item.averageScores?.practical || 0,
            presentation: item.averageScores?.presentation || 0,
            impact: item.averageScores?.impact || 0,
          },
        }));
        
        setProjectRankings(rankings);
      }
    } catch (error) {
      console.error('Error fetching project rankings:', error);
    } finally {
      setLoading('fetchProjectRankings', false);
    }
  },
  
  fetchCategoryStats: async () => {
    const { setLoading, setCategoryStats, loading } = get();
    
    if (loading.fetchCategoryStats) {
      return;
    }
    
    try {
      setLoading('fetchCategoryStats', true);
      
      // 获取项目和分类数据
      const [projectsData, categoriesData] = await Promise.all([
        api.get('/api/admin/projects'),
        api.get('/api/categories'),
      ]);
      
      const projects = projectsData.projects || [];
      const categories = categoriesData.categories || [];
      
      // 计算每个分类的统计数据
      const stats: CategoryStats[] = categories.map((category: any) => {
        const categoryProjects = projects.filter((p: any) => p.categoryId === category.id);
        const totalVotes = categoryProjects.reduce((sum: number, p: any) => sum + (p.voteCount || 0), 0);
        const avgScore = categoryProjects.length > 0 
          ? categoryProjects.reduce((sum: number, p: any) => sum + (p.avgScore || 0), 0) / categoryProjects.length
          : 0;
        
        return {
          category: category.name,
          projects: categoryProjects.length,
          avgScore: Number(avgScore.toFixed(1)),
          totalVotes,
        };
      });
      
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading('fetchCategoryStats', false);
    }
  },
  
  refreshAllData: async () => {
    await Promise.all([
      get().fetchDashboardStats(),
      get().fetchProjectRankings(),
      get().fetchCategoryStats(),
    ]);
  },
}));
