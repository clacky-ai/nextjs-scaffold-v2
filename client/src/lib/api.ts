/**
 * 统一的 API 客户端
 * 支持认证、错误处理、类型安全等功能
 */

// 获取用户认证 token 的函数
const getUserAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;

    const authData = JSON.parse(authStorage);
    return authData?.state?.token || null;
  } catch {
    return null;
  }
};

// 获取管理员认证 token 的函数
const getAdminAuthToken = (): string | null => {
  try {
    const adminAuthStorage = localStorage.getItem('admin-auth-storage');
    if (!adminAuthStorage) return null;

    const adminAuthData = JSON.parse(adminAuthStorage);
    return adminAuthData?.state?.token || null;
  } catch {
    return null;
  }
};

// 根据 URL 自动选择合适的 token
const getAuthToken = (url: string): string | null => {
  // 如果是管理员 API，使用管理员 token
  if (url.includes('/api/admin/')) {
    return getAdminAuthToken();
  }
  // 否则使用用户 token
  return getUserAuthToken();
};

// API 错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API 请求配置
interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
}

// 基础 API 请求函数
async function baseApiRequest(config: ApiRequestConfig): Promise<Response> {
  const { method, url, data, headers = {} } = config;

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 自动添加认证头（如果 token 存在）
  const authToken = getAuthToken(url);
  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // 发送请求
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  // 检查响应状态
  if (!response.ok) {
    let errorMessage = response.statusText;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 如果无法解析 JSON，使用默认错误信息
    }
    
    throw new ApiError(errorMessage, response.status, response);
  }

  return response;
}

// 返回 JSON 数据的 API 请求
export async function apiRequest<T = any>(config: ApiRequestConfig): Promise<T> {
  const response = await baseApiRequest(config);
  return response.json();
}

// 返回 Response 对象的 API 请求（兼容原有的 queryClient）
export async function apiRequestRaw(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  return baseApiRequest({
    method: method as any,
    url,
    data,
  });
}

// 统一的 API 方法（自动处理认证）
export const api = {
  get: <T = any>(url: string): Promise<T> =>
    apiRequest<T>({ method: 'GET', url }),

  post: <T = any>(url: string, data?: unknown): Promise<T> =>
    apiRequest<T>({ method: 'POST', url, data }),

  put: <T = any>(url: string, data?: unknown): Promise<T> =>
    apiRequest<T>({ method: 'PUT', url, data }),

  delete: <T = any>(url: string): Promise<T> =>
    apiRequest<T>({ method: 'DELETE', url }),

  patch: <T = any>(url: string, data?: unknown): Promise<T> =>
    apiRequest<T>({ method: 'PATCH', url, data }),
};

// API 端点常量
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },

  // 管理员认证相关
  ADMIN_AUTH: {
    LOGIN: '/api/admin/auth/login',
    REGISTER: '/api/admin/auth/register',
    ME: '/api/admin/auth/me',
    LOGOUT: '/api/admin/auth/logout',
  },
  
  // 项目相关
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    DETAIL: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
    CAN_VOTE: (id: string) => `/api/projects/${id}/can-vote`,
    VOTES: (id: string) => `/api/projects/${id}/votes`,
  },
  
  // 分类相关
  CATEGORIES: {
    LIST: '/api/categories',
  },
  
  // 投票相关
  VOTES: {
    STATS: '/api/votes/stats',
    MY_VOTES: '/api/votes/my-votes',
    RESULTS: '/api/votes/results',
    SUBMIT: '/api/votes',
  },
  
  // 评分维度
  SCORE_DIMENSIONS: {
    LIST: '/api/score-dimensions',
  },
} as const;

// 类型定义
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


