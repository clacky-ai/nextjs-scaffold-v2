import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, API_ENDPOINTS } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  realName: string;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  realName: string;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}



export const useUserAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password,
          });

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : '登录失败',
          });
          throw error;
        }
      },
      
      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : '注册失败',
          });
          throw error;
        }
      },
      
      logout: () => {
        const { token } = get();

        // 异步调用登出API，但不等待结果
        if (token) {
          api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(console.error);
        }

        // 立即清除本地状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
      
      checkAuth: async () => {
        const { token } = get();

        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await api.get(API_ENDPOINTS.AUTH.ME);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token 无效，清除状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化 user、token 和 isAuthenticated，不持久化 loading 和 error 状态
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 便捷的 hooks
export const useAuth = () => {
  const store = useUserAuthStore();
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
};

export const useUser = () => useUserAuthStore((state) => state.user);
export const useIsAuthenticated = () => useUserAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useUserAuthStore((state) => state.isLoading);
export const useAuthError = () => useUserAuthStore((state) => state.error);

export default useUserAuthStore;