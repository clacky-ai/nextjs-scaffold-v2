import { create } from 'zustand';
import { api } from '@/lib/api';
import { Project, LoadingState } from './types';

interface ProjectStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  avgScore: number;
}

interface ProjectStore {
  // State
  projects: Project[];
  loading: LoadingState;
  searchTerm: string;
  statusFilter: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string | null) => void;
  
  // API Actions
  fetchProjects: () => Promise<void>;
  toggleProjectStatus: (projectId: string, isBlocked: boolean) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  
  // Computed
  stats: () => ProjectStats;
  filteredProjects: () => Project[];
  refreshData: () => Promise<void>;
}

export const useAdminProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projects: [],
  loading: {},
  searchTerm: '',
  statusFilter: null,
  
  // Basic actions
  setProjects: (projects) => set({ projects }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  
  // API actions
  fetchProjects: async () => {
    const { setLoading, setProjects, loading } = get();
    
    if (loading.fetchProjects) {
      return;
    }
    
    try {
      setLoading('fetchProjects', true);
      const data = await api.get('/api/admin/projects');
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading('fetchProjects', false);
    }
  },
  
  toggleProjectStatus: async (projectId: string, isBlocked: boolean) => {
    const { setLoading, projects, setProjects } = get();
    
    try {
      setLoading('toggleProject', true);
      
      await api.patch(`/api/admin/projects/${projectId}`, {
        isBlocked: !isBlocked
      });
      
      // Update local state
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? { ...project, isBlocked: !isBlocked }
          : project
      );
      setProjects(updatedProjects);
      
      return true;
    } catch (error) {
      console.error('Error toggling project status:', error);
      return false;
    } finally {
      setLoading('toggleProject', false);
    }
  },
  
  deleteProject: async (projectId: string) => {
    const { setLoading, projects, setProjects } = get();
    
    try {
      setLoading('deleteProject', true);
      
      await api.delete(`/api/admin/projects/${projectId}`);
      
      // Update local state
      const updatedProjects = projects.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    } finally {
      setLoading('deleteProject', false);
    }
  },
  
  // Computed properties
  stats: () => {
    const { projects } = get();
    const total = projects.length;
    const approved = projects.filter(p => !p.isBlocked).length;
    const pending = 0; // 需要根据实际状态字段调整
    const rejected = projects.filter(p => p.isBlocked).length;
    const avgScore = projects.reduce((sum, p) => sum + (p.voteCount || 0), 0) / (total || 1);
    
    return {
      total,
      approved,
      pending,
      rejected,
      avgScore: Number(avgScore.toFixed(1)),
    };
  },
  
  filteredProjects: () => {
    const { projects, searchTerm, statusFilter } = get();
    
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter ||
        (statusFilter === 'approved' && !project.isBlocked) ||
        (statusFilter === 'rejected' && project.isBlocked);
      
      return matchesSearch && matchesStatus;
    });
  },
  
  refreshData: async () => {
    await get().fetchProjects();
  },
}));
