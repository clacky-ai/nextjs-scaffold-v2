// WebSocket 消息类型定义

export interface BaseMessage {
  type: string;
  timestamp: number;
  data?: any;
}

export interface MessageHandler {
  (messageData: BaseMessage): void;
}

export interface WebSocketModule {
  getMessageHandlers(): Record<string, MessageHandler>;
  getSubscriptions?(): string[];
}

// 连接状态
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// WebSocket 事件类型
export const WS_EVENTS = {
  // 用户相关
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USERS_ACTIVE_UPDATE: 'users:active_update',
  
  // 连接相关
  CONNECTION_SUCCESS: 'connection:success',
  CONNECTION_ERROR: 'connection:error',
  
  // 房间相关
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_MESSAGE: 'room:message',
  
  // 订阅相关
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe'
} as const;

export type WSEventType = typeof WS_EVENTS[keyof typeof WS_EVENTS];
