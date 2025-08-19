import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface User {
  id: string;
  email: string;
  realName: string;
  organization?: string;
  department?: string;
  position?: string;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  realName: string;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
}

// 获取存储的token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 设置token
function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// 移除token
function removeToken(): void {
  localStorage.removeItem('auth_token');
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

// 登录API
async function loginApi(data: LoginData) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '登录失败' }));
    throw new Error(error.message || '登录失败');
  }

  return response.json();
}

// 注册API
async function registerApi(data: RegisterData) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '注册失败' }));
    throw new Error(error.message || '注册失败');
  }

  return response.json();
}

// 获取当前用户信息API
async function getCurrentUser(): Promise<User> {
  return fetchWithAuth('/api/auth/me');
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取当前用户信息
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 登录mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast({
        title: "登录成功",
        description: `欢迎回来，${data.user.realName}！`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 注册mutation
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast({
        title: "注册成功",
        description: `欢迎加入，${data.user.realName}！`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 登出函数
  const logout = () => {
    removeToken();
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.clear();
    toast({
      title: "已退出登录",
      description: "您已成功退出登录",
    });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
