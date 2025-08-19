import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_ENDPOINTS } from '@/lib/api';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AdminAuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

type AdminAuthStore = AdminAuthState & AdminAuthActions;

const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      // State
      adminUser: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(API_ENDPOINTS.ADMIN_AUTH.LOGIN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 包含cookies
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || '登录失败');
          }

          set({
            adminUser: data.adminUser,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || '登录失败，请稍后重试',
            isLoading: false,
            isAuthenticated: false,
            adminUser: null,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await fetch(API_ENDPOINTS.ADMIN_AUTH.LOGOUT, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${get().token}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            adminUser: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: async () => {
        const { token, isLoading } = get();

        // 防止重复调用
        if (isLoading) {
          return;
        }

        if (!token) {
          set({ isAuthenticated: false, adminUser: null, isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await fetch(API_ENDPOINTS.ADMIN_AUTH.ME, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Authentication failed');
          }

          const data = await response.json();
          set({
            adminUser: data.adminUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            adminUser: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        adminUser: state.adminUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hooks for easier usage
export const useAdminAuth = () => {
  const store = useAdminAuthStore();
  return {
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
    checkAuth: store.checkAuth,
    isLoading: store.isLoading,
    error: store.error,
  };
};

export const useIsAdminAuthenticated = () => useAdminAuthStore((state) => state.isAuthenticated);
export const useAdminUser = () => useAdminAuthStore((state) => state.adminUser);
export const useAdminAuthLoading = () => useAdminAuthStore((state) => state.isLoading);

export default useAdminAuthStore;
