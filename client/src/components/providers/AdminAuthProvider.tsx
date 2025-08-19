import { useEffect } from 'react';
import { useAdminAuth } from '@/stores/admin/authStore';

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { checkAuth } = useAdminAuth();

  useEffect(() => {
    // 初始化时检查管理员认证状态
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
