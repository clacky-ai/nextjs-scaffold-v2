import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Project {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  submitterId: string;
  demoUrl?: string;
  repositoryUrl?: string;
  presentationUrl?: string;
  tags: string[];
  teamMembers: { id: string; name: string; role?: string }[];
  isActive: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  categoryId?: string;
  demoUrl?: string;
  repositoryUrl?: string;
  presentationUrl?: string;
  tags: string[];
  teamMembers: { id: string; name: string; role?: string }[];
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

// 获取项目列表
async function getProjects(): Promise<Project[]> {
  return fetchWithAuth('/api/projects');
}

// 获取项目详情
async function getProject(id: string): Promise<Project> {
  return fetchWithAuth(`/api/projects/${id}`);
}

// 创建项目
async function createProject(data: CreateProjectData): Promise<{ message: string; project: Project }> {
  return fetchWithAuth('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 获取分类列表
async function getCategories(): Promise<Category[]> {
  return fetchWithAuth('/api/categories');
}

// 初始化默认分类（仅开发环境）
async function initCategories(): Promise<{ message: string; categories: Category[] }> {
  return fetchWithAuth('/api/init-categories', {
    method: 'POST',
  });
}

export function useProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取项目列表
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 2 * 60 * 1000, // 2分钟
  });

  // 获取分类列表
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10分钟
  });

  // 创建项目mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "项目提交成功",
        description: `项目"${data.project.title}"已成功提交！`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "项目提交失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 初始化分类mutation
  const initCategoriesMutation = useMutation({
    mutationFn: initCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "分类初始化成功",
        description: "默认分类已创建",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "分类初始化失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    categories,
    isProjectsLoading,
    isCategoriesLoading,
    createProject: createProjectMutation.mutate,
    initCategories: initCategoriesMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    isInitializingCategories: initCategoriesMutation.isPending,
  };
}

// 获取单个项目的Hook
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
