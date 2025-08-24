import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  demoUrl?: string;
  repositoryUrl?: string;
  presentationUrl?: string;
  categoryId?: string;
  submitterId: string;
  teamMembers: string[];
  tags: string[];
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  status: 'draft' | 'submitted' | 'published';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  demoUrl?: string;
  repositoryUrl?: string;
  presentationUrl?: string;
  categoryId?: string;
  teamMembers?: string[];
  tags?: string[];
}

interface ProjectsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  search?: string;
}

interface ProjectsResult {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProjectState {
  // State
  projects: Project[];
  currentProject: Project | null;
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  
  // Filters
  selectedCategory: string | null;
  searchQuery: string;
  statusFilter: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string | null) => void;
  
  // API Actions
  fetchCategories: () => Promise<void>;
  fetchProjects: (query?: ProjectsQuery) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (projectData: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, projectData: Partial<ProjectFormData>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
}



export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  categories: [],
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  total: 0,
  
  // Filters
  selectedCategory: null,
  searchQuery: '',
  statusFilter: null,
  
  // Actions
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  clearError: () => set({ error: null }),
  
  resetFilters: () => set({
    selectedCategory: null,
    searchQuery: '',
    statusFilter: null,
    currentPage: 1,
  }),
  
  // API Actions
  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get('/api/categories');

      set({
        categories: response.categories,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取分类失败',
      });
    }
  },
  
  fetchProjects: async (query?: ProjectsQuery) => {
    try {
      set({ isLoading: true, error: null });

      const { selectedCategory, searchQuery, statusFilter, currentPage } = get();

      const params = new URLSearchParams();
      params.append('page', String(query?.page || currentPage));
      params.append('limit', String(query?.limit || 10));

      if (query?.categoryId || selectedCategory) {
        params.append('category', query?.categoryId || selectedCategory!);
      }

      if (query?.status || statusFilter) {
        params.append('status', query?.status || statusFilter!);
      }

      if (query?.search || searchQuery) {
        params.append('search', query?.search || searchQuery);
      }

      const response = await api.get(`/api/projects?${params.toString()}`);

      set({
        projects: response.projects,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取项目列表失败',
      });
    }
  },
  
  fetchProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get(`/api/projects/${id}`);

      set({
        currentProject: response.project,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取项目详情失败',
      });
    }
  },
  
  createProject: async (projectData: ProjectFormData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post('/api/projects', projectData);

      // 更新项目列表
      const { projects } = get();
      set({
        projects: [response.project, ...projects],
        isLoading: false,
      });

      return response.project;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '创建项目失败',
      });
      throw error;
    }
  },
  
  updateProject: async (id: string, projectData: Partial<ProjectFormData>) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.put(`/api/projects/${id}`, projectData);

      // 更新项目列表和当前项目
      const { projects, currentProject } = get();
      const updatedProjects = projects.map(p => p.id === id ? response.project : p);

      set({
        projects: updatedProjects,
        currentProject: currentProject?.id === id ? response.project : currentProject,
        isLoading: false,
      });

      return response.project;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '更新项目失败',
      });
      throw error;
    }
  },
  
  deleteProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.delete(`/api/projects/${id}`);

      // 从项目列表中移除
      const { projects, currentProject } = get();
      const filteredProjects = projects.filter(p => p.id !== id);

      set({
        projects: filteredProjects,
        currentProject: currentProject?.id === id ? null : currentProject,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除项目失败',
      });
      throw error;
    }
  },
}));

// 便捷的 hooks
export const useProjects = () => useProjectStore((state) => state.projects);
export const useCurrentProject = () => useProjectStore((state) => state.currentProject);
export const useCategories = () => useProjectStore((state) => state.categories);
export const useProjectLoading = () => useProjectStore((state) => state.isLoading);
export const useProjectError = () => useProjectStore((state) => state.error);
