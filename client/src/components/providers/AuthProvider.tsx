import { useEffect, ReactNode } from 'react';
import { useUserAuthStore } from '@/stores/users/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const checkAuth = useUserAuthStore((state) => state.checkAuth);
  const token = useUserAuthStore((state) => state.token);
  const user = useUserAuthStore((state) => state.user);

  useEffect(() => {
    // 组件挂载时检查认证状态
    // 只有当有token但没有user时才检查
    if (token && !user) {
      checkAuth();
    }
  }, [checkAuth, token, user]);

  return <>{children}</>;
};
