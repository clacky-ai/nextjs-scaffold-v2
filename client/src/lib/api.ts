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

// 错误处理函数
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// 主要的 API 请求函数
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 自动添加认证头（如果 token 存在）
  const authToken = getAuthToken(url);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// 便捷的 API 方法
export const api = {
  get: async <T = any>(url: string): Promise<T> => {
    const response = await apiRequest('GET', url);
    return response.json();
  },

  post: async <T = any>(url: string, data?: unknown): Promise<T> => {
    const response = await apiRequest('POST', url, data);
    return response.json();
  },

  put: async <T = any>(url: string, data?: unknown): Promise<T> => {
    const response = await apiRequest('PUT', url, data);
    return response.json();
  },

  delete: async <T = any>(url: string): Promise<T> => {
    const response = await apiRequest('DELETE', url);
    return response.json();
  },

  patch: async <T = any>(url: string, data?: unknown): Promise<T> => {
    const response = await apiRequest('PATCH', url, data);
    return response.json();
  },
};

