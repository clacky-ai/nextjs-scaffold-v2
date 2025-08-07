import { create } from 'zustand'
import { Project, ProjectStats, LoadingState } from './types'
import { toast } from 'sonner'

interface ProjectStore {
  // State
  projects: Project[]
  loading: LoadingState
  searchTerm: string
  
  // Actions
  setProjects: (projects: Project[]) => void
  setLoading: (key: string, loading: boolean) => void
  setSearchTerm: (term: string) => void
  
  // API Actions
  fetchProjects: () => Promise<void>
  toggleProjectStatus: (projectId: string, isBlocked: boolean) => Promise<boolean>
  deleteProject: (projectId: string) => Promise<boolean>
  
  // Computed
  stats: () => ProjectStats
  filteredProjects: () => Project[]
  refreshData: () => Promise<void>
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
    const { setLoading, setProjects, loading } = get()
    
    // Prevent duplicate requests
    if (loading.fetchProjects) {
      return
    }
    
    try {
      setLoading('fetchProjects', true)
      const response = await fetch('/api/admin/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const projects = await response.json()
      setProjects(projects)
      
    } catch (error) {
      console.error('获取项目列表失败:', error)
      toast.error('获取项目列表失败')
    } finally {
      setLoading('fetchProjects', false)
    }
  },
  
  
  toggleProjectStatus: async (projectId, isBlocked) => {
    const { setLoading, projects, setProjects } = get()
    
    try {
      setLoading(`toggleProject_${projectId}`, true)
      
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update project status')
      }
      
      // Update local state - stats will be automatically recalculated
      const updatedProjects = projects.map(project =>
        project.id === projectId ? { ...project, isBlocked: !isBlocked } : project
      )
      setProjects(updatedProjects)
      
      toast.success(
        !isBlocked ? '项目已被屏蔽' : '项目屏蔽已解除'
      )
      
      return true
      
    } catch (error) {
      console.error('更新项目状态失败:', error)
      toast.error('更新项目状态失败')
      return false
    } finally {
      setLoading(`toggleProject_${projectId}`, false)
    }
  },
  
  deleteProject: async (projectId) => {
    const { setLoading, projects, setProjects } = get()
    
    try {
      setLoading(`deleteProject_${projectId}`, true)
      
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      // Update local state - stats will be automatically recalculated
      const updatedProjects = projects.filter(project => project.id !== projectId)
      setProjects(updatedProjects)
      
      toast.success('项目已删除')
      return true
      
    } catch (error) {
      console.error('删除项目失败:', error)
      toast.error('删除项目失败')
      return false
    } finally {
      setLoading(`deleteProject_${projectId}`, false)
    }
  },
  
  // Computed values
  stats: () => {
    const { projects } = get()
    return {
      total: projects.length,
      active: projects.filter(p => !p.isBlocked).length,
      blocked: projects.filter(p => p.isBlocked).length
    }
  },
  
  filteredProjects: () => {
    const { projects, searchTerm } = get()
    
    if (!searchTerm) return projects
    
    const term = searchTerm.toLowerCase()
    return projects.filter(project =>
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.authorName.toLowerCase().includes(term)
    )
  },
  
  refreshData: async () => {
    await get().fetchProjects()
  }
}))