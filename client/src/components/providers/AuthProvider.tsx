import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/users/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // 组件挂载时检查认证状态
    // 只有当有token但没有user时才检查
    if (token && !user) {
      checkAuth();
    }
  }, [checkAuth, token, user]);

  return <>{children}</>;
};
