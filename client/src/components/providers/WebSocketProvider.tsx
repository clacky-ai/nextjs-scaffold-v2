import { useEffect } from 'react';
import { communicationManager } from '@/lib/websocket/CommunicationManager';
import { getAuthToken } from '@/lib/api';
import useAdminAuthStore from '@/stores/admin/authStore';
import useUserAuthStore from '@/stores/users/authStore';

// 获取 WebSocket 认证 token 的函数
const getWebSocketAuthToken = (): string | null => {
  // 使用统一的 getAuthToken 函数，传入当前页面 URL
  return getAuthToken(window.location.href);
};

function getTokenFromState(url: string) {
  let token;
  if (url.includes('/api/admin/') || url.includes('/admin/')) {
    token = useAdminAuthStore.getState().token;
  } else {
    token = useUserAuthStore.getState().token;
  }
  return token;
}

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log('WebSocketProvider: 初始化 WebSocket 连接');

    const token = getWebSocketAuthToken();
    if (!token) {
      return;
    }

    // 初始化通信管理器
    communicationManager.initialize({
      token: token || undefined,
      onConnectionStateChange: (state) => {
      },
      onError: (error) => {
      }
    });

    // 清理函数
    return () => {
      console.log('WebSocketProvider: 清理 WebSocket 连接');
      communicationManager.destroy();
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 监听认证状态变化，重新初始化连接
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getTokenFromState(window.location.href);
      if (!token) {
        return;
      }

      communicationManager.initialize({
        token: token || undefined,
        onConnectionStateChange: (state) => {
        },
        onError: (error) => {
        }
      });
    };

    // 订阅 admin auth store 变化
    const unsubscribeAdmin = useAdminAuthStore.subscribe(handleAuthChange);

    // 订阅 user auth store 变化
    const unsubscribeUser = useUserAuthStore.subscribe(handleAuthChange);

    return () => {
      unsubscribeAdmin();
      unsubscribeUser();
    };
  }, []); // 不依赖任何变量，避免无限重连

  return <>{children}</>;
};
