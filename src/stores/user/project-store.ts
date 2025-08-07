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
  submitProject: (projectData: {
    title: string
    description: string
    teamMembers: string[]
    demoLink?: string
    category?: string
    tags?: string[]
  }) => Promise<boolean>
  
  // Real-time updates
  updateProjectVoteCount: (projectId: string, newVoteCount: number) => void
  
  // Computed
  stats: (userId?: string) => ProjectStats
  filteredProjects: () => Project[]
  sortedProjects: () => Project[]
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
  
  // API Actions
  fetchProjects: async () => {
    const { setLoading, setProjects } = get()
    
    try {
      setLoading('fetchProjects', true)
      
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data)
      
    } catch (error) {
      console.error('获取项目列表失败:', error)
      toast.error('获取项目列表失败')
    } finally {
      setLoading('fetchProjects', false)
    }
  },
  
  submitProject: async (projectData) => {
    const { setLoading, fetchProjects } = get()
    
    try {
      setLoading('submitProject', true)
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit project')
      }
      
      toast.success('项目提交成功！')
      
      // Refresh projects list
      await fetchProjects()
      
      return true
      
    } catch (error: any) {
      console.error('项目提交失败:', error)
      toast.error(error.message || '项目提交失败')
      return false
    } finally {
      setLoading('submitProject', false)
    }
  },
  
  // Real-time updates
  updateProjectVoteCount: (projectId, newVoteCount) => {
    const { projects, setProjects } = get()
    
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, voteCount: newVoteCount }
        : project
    )
    
    setProjects(updatedProjects)
  },
  
  // Computed values
  stats: (userId) => {
    const { projects } = get()
    
    const myProjects = userId 
      ? projects.filter(p => p.submitterId === userId || 
          JSON.parse(p.teamMembers || '[]').includes(userId)).length
      : 0
    
    return {
      total: projects.length,
      myProjects,
      votedProjects: 0 // This will be calculated by vote store
    }
  },
  
  filteredProjects: () => {
    const { projects, searchTerm } = get()
    
    if (!searchTerm) return projects
    
    const term = searchTerm.toLowerCase()
    return projects.filter(project =>
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.submitterName.toLowerCase().includes(term) ||
      (project.category && project.category.toLowerCase().includes(term)) ||
      (project.tags && project.tags.toLowerCase().includes(term))
    )
  },
  
  sortedProjects: () => {
    const { filteredProjects } = get()
    return filteredProjects().sort((a, b) => b.voteCount - a.voteCount)
  },
  
  refreshData: async () => {
    await get().fetchProjects()
  }
}))
