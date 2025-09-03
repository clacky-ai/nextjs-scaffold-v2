import type { ConnectionState, NotificationData } from '@/lib/websocket/types';

// WebSocket Store 状态类型
export interface WebSocketState {
  // 连接状态
  connectionState: ConnectionState;
  
  // 实时数据
  realTimeData: {
    votes: Record<string, any>; // projectId -> vote data
    projects: Record<string, any>; // projectId -> project data
    activeUsers: any[]; // 在线用户列表
    onlineCount: number; // 在线用户数
  };
  
  // 通知队列
  notifications: NotificationData[];
  
  // 订阅管理
  subscriptions: Set<string>;
}

// WebSocket Store Actions
export interface WebSocketActions {
  // 连接状态管理
  setConnectionState: (state: ConnectionState) => void;
  
  // 实时数据更新
  updateProjectVote: (projectId: string, voteData: any) => void;
  updateProject: (projectId: string, projectData: any) => void;
  setActiveUsers: (users: any[]) => void;
  addOnlineUser: (user: any) => void;
  removeOnlineUser: (userId: string) => void;
  setOnlineCount: (count: number) => void;
  
  // 通知管理
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 订阅管理
  addSubscription: (eventType: string) => void;
  removeSubscription: (eventType: string) => void;
  clearSubscriptions: () => void;
  
  // 数据清理
  clearRealTimeData: () => void;
}

export type WebSocketStore = WebSocketState & WebSocketActions;

// 通知服务接口
export interface NotificationService {
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
