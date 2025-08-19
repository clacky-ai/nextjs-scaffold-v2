import { create } from 'zustand';
import { Project, ProjectStats, LoadingState } from './types';

interface ProjectStore {
  // State
  projects: Project[];
  loading: LoadingState;
  searchTerm: string;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  
  // API Actions
  fetchProjects: () => Promise<void>;
  toggleProjectStatus: (projectId: string, isBlocked: boolean) => Promise<boolean>;
  
  // Computed
  stats: () => ProjectStats;
  filteredProjects: () => Project[];
  refreshData: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projects: [],
  loading: {},
  searchTerm: '',
  
  // Basic actions
  setProjects: (projects) => set({ projects }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  // API actions
  fetchProjects: async () => {
    const { setLoading, setProjects, loading } = get();
    
    // Prevent duplicate requests
    if (loading.fetchProjects) {
      return;
    }
    
    try {
      setLoading('fetchProjects', true);
      const response = await fetch('/api/admin/projects', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // You can add toast notification here if needed
    } finally {
      setLoading('fetchProjects', false);
    }
  },
  
  toggleProjectStatus: async (projectId: string, isBlocked: boolean) => {
    const { setLoading, projects, setProjects } = get();
    
    try {
      setLoading('toggleProjectStatus', true);
      const response = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isBlocked }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project status');
      }
      
      // Update local state
      const updatedProjects = projects.map(project => 
        project.id === projectId ? { ...project, isBlocked } : project
      );
      setProjects(updatedProjects);
      
      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      return false;
    } finally {
      setLoading('toggleProjectStatus', false);
    }
  },
  
  // Computed properties
  stats: () => {
    const { projects } = get();
    const total = projects.length;
    const blocked = projects.filter(project => project.isBlocked).length;
    const active = total - blocked;
    
    return { total, active, blocked };
  },
  
  filteredProjects: () => {
    const { projects, searchTerm } = get();
    
    if (!searchTerm) {
      return projects;
    }
    
    const term = searchTerm.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.authorName.toLowerCase().includes(term)
    );
  },
  
  refreshData: async () => {
    const { fetchProjects } = get();
    await fetchProjects();
  }
}));
