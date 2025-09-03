import { BaseModule } from '@/lib/websocket/BaseModule';
import { WS_EVENTS } from '@/lib/websocket/types';
import type { BaseMessage } from '@/lib/websocket/types';

// 在线用户数据接口
export interface OnlineUserData {
  userId: string;
  username: string;
  email?: string;
  avatar?: string;
  joinTime: number;
  lastActivity: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface UserOnlineData {
  userId: string;
  username: string;
  userInfo: OnlineUserData;
  joinTime: number;
}

export interface UserOfflineData {
  userId: string;
  username: string;
  leaveTime: number;
  reason?: 'disconnect' | 'logout' | 'timeout';
}

export interface ActiveUsersUpdateData {
  activeUsers: OnlineUserData[];
  onlineCount: number;
  totalUsers?: number;
  timestamp: number;
}

// Admin 在线用户 Store 接口
interface AdminOnlineUsersStore {
  // 状态
  onlineUsers: OnlineUserData[];
  onlineCount: number;
  totalUsers: number;
  lastUpdated: number;
  
  // Actions
  setOnlineUsers: (users: OnlineUserData[]) => void;
  addOnlineUser: (user: OnlineUserData) => void;
  removeOnlineUser: (userId: string) => void;
  updateOnlineUser: (userId: string, updates: Partial<OnlineUserData>) => void;
  setOnlineCount: (count: number) => void;
  setTotalUsers: (count: number) => void;
  updateLastUpdated: () => void;
}

export class OnlineUsersModule extends BaseModule<AdminOnlineUsersStore> {
  constructor(store: AdminOnlineUsersStore) {
    super(store);
    this.log('OnlineUsersModule 初始化完成');
  }

  getMessageHandlers() {
    return {
      [WS_EVENTS.USER_ONLINE]: this.handleUserOnline,
      [WS_EVENTS.USER_OFFLINE]: this.handleUserOffline,
      [WS_EVENTS.USERS_ACTIVE_UPDATE]: this.handleActiveUsersUpdate,
    };
  }

  getSubscriptions() {
    return ['admin:users:*', 'user:*', 'users:*']; // 订阅管理员用户相关事件
  }

  // 处理用户上线事件
  private handleUserOnline = (messageData: BaseMessage) => {
    this.log('处理用户上线事件', messageData);

    if (!this.validateMessageData(messageData, ['userId', 'username', 'userInfo'])) {
      return;
    }

    this.safeExecute(() => {
      const data = this.getMessageData<UserOnlineData>(messageData);
      const { userInfo } = data;

      // 添加用户到在线列表
      this.store.addOnlineUser(userInfo);
      this.store.updateLastUpdated();

      this.log(`用户 ${data.username} (ID: ${data.userId}) 上线`);
    }, '处理用户上线事件失败');
  };

  // 处理用户下线事件
  private handleUserOffline = (messageData: BaseMessage) => {
    this.log('处理用户下线事件', messageData);

    if (!this.validateMessageData(messageData, ['userId', 'username'])) {
      return;
    }

    this.safeExecute(() => {
      const data = this.getMessageData<UserOfflineData>(messageData);
      const { userId, username, reason } = data;

      // 从在线列表中移除用户
      this.store.removeOnlineUser(userId);
      this.store.updateLastUpdated();

      this.log(`用户 ${username} (ID: ${userId}) 下线，原因: ${reason || '未知'}`);
    }, '处理用户下线事件失败');
  };

  // 处理在线用户列表更新事件
  private handleActiveUsersUpdate = (messageData: BaseMessage) => {
    this.log('处理在线用户列表更新', messageData);

    if (!this.validateMessageData(messageData, ['activeUsers', 'onlineCount'])) {
      return;
    }

    this.safeExecute(() => {
      const data = this.getMessageData<ActiveUsersUpdateData>(messageData);
      const { activeUsers, onlineCount, totalUsers, timestamp } = data;

      // 批量更新在线用户列表
      this.store.setOnlineUsers(activeUsers);
      this.store.setOnlineCount(onlineCount);
      
      if (totalUsers !== undefined) {
        this.store.setTotalUsers(totalUsers);
      }
      
      this.store.updateLastUpdated();

      this.log(`在线用户列表更新完成: ${onlineCount} 人在线，总用户数: ${totalUsers || '未知'}`);
    }, '处理在线用户列表更新失败');
  };

  // 请求当前在线用户列表
  public requestOnlineUsers() {
    this.log('请求当前在线用户列表');

    // 注意：这里需要通过 CommunicationManager 发送消息
    // 但由于架构限制，我们暂时不在模块中直接发送消息
    // 而是在页面组件中调用 CommunicationManager
    this.log('需要在页面组件中通过 CommunicationManager 发送请求');
  }

  // 踢出用户（管理员功能）
  public kickUser(userId: string, reason?: string) {
    this.log(`管理员踢出用户: ${userId}，原因: ${reason || '无'}`);
    
    // 发送踢出用户的消息
    // communicationManager.send('admin:users:kick', { userId, reason });
  }

  // 获取用户详细信息
  public requestUserDetails(userId: string) {
    this.log(`请求用户详细信息: ${userId}`);
    
    // 发送获取用户详情的消息
    // communicationManager.send('admin:users:get_details', { userId });
  }
}
