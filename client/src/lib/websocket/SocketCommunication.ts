import io, { Socket } from 'socket.io-client';
import type { BaseMessage, ConnectionState, WebSocketModule } from './types';

class SocketCommunication {
  private socket: Socket | null = null;
  private messageHandlers = new Map<string, Function>();
  private modules = new Map<string, WebSocketModule>();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // 回调函数
  private onConnectionStateChange: ((state: ConnectionState) => void) | null = null;
  private onError: ((error: any) => void) | null = null;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
  }

  // 初始化连接
  initialize(url: string, token?: string, options = {}) {
    if (this.socket) {
      this.disconnect();
    }

    console.log('初始化 WebSocket 连接:', url);

    this.socket = io(url, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      ...options
    });

    this.setupEventListeners();
  }

  // 设置事件监听
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket 已连接');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.notifyConnectionStateChange('connected');
      
      // 重新注册所有模块的订阅
      this.modules.forEach(module => {
        if (module.getSubscriptions) {
          const subscriptions = module.getSubscriptions();
          subscriptions.forEach(eventType => {
            this.subscribe(eventType);
          });
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket 连接断开:', reason);
      this.connectionState = 'disconnected';
      this.notifyConnectionStateChange('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error);
      this.connectionState = 'error';
      this.notifyConnectionStateChange('error');
      this.notifyError(error);
    });

    // 监听消息
    this.socket.on('message', this.handleMessage);

    // 监听所有自定义事件
    this.socket.onAny((eventName: string, data: any) => {
      if (!['connect', 'disconnect', 'connect_error', 'message'].includes(eventName)) {
        this.handleMessage({ type: eventName, timestamp: Date.now(), data });
      }
    });
  }

  // 核心消息分发方法
  private handleMessage(messageData: BaseMessage) {
    console.log('收到 WebSocket 消息:', messageData);
    
    const { type } = messageData;
    if (!type) {
      console.warn('消息缺少 type 字段:', messageData);
      return;
    }

    // 查找对应的处理器
    const handler = this.messageHandlers.get(type);
    if (handler) {
      try {
        handler(messageData);
      } catch (error) {
        console.error(`处理消息 ${type} 时出错:`, error);
        this.notifyError(error);
      }
    } else {
      console.warn(`未找到消息类型 ${type} 的处理器`);
    }
  }

  // 注册业务模块
  registerModule(moduleName: string, moduleInstance: WebSocketModule) {
    console.log(`注册 WebSocket 模块: ${moduleName}`);
    
    this.modules.set(moduleName, moduleInstance);
    
    // 获取模块的消息处理器映射
    const handlers = moduleInstance.getMessageHandlers();
    
    Object.entries(handlers).forEach(([messageType, handlerMethod]) => {
      // 绑定 this 上下文到模块实例
      const boundHandler = handlerMethod.bind(moduleInstance);
      this.messageHandlers.set(messageType, boundHandler);
      console.log(`注册消息处理器: ${messageType} -> ${moduleName}`);
    });
  }

  // 注销模块
  unregisterModule(moduleName: string) {
    const module = this.modules.get(moduleName);
    if (module) {
      const handlers = module.getMessageHandlers();
      Object.keys(handlers).forEach(messageType => {
        this.messageHandlers.delete(messageType);
      });
    }
    this.modules.delete(moduleName);
  }

  // 发送消息
  send(messageType: string, data: any = {}): boolean {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket 未连接，无法发送消息');
      return false;
    }

    const message: BaseMessage = {
      type: messageType,
      timestamp: Date.now(),
      data
    };

    this.socket.emit('message', message);
    console.log('发送 WebSocket 消息:', message);
    return true;
  }

  // 订阅特定事件
  subscribe(eventType: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket 未连接，无法订阅事件');
      return;
    }

    this.socket.emit('subscribe', { eventType });
    console.log('订阅事件:', eventType);
  }

  // 取消订阅
  unsubscribe(eventType: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket 未连接，无法取消订阅');
      return;
    }

    this.socket.emit('unsubscribe', { eventType });
    console.log('取消订阅:', eventType);
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
  }

  // 获取连接状态
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // 状态变化通知
  private notifyConnectionStateChange(state: ConnectionState) {
    if (this.onConnectionStateChange) {
      this.onConnectionStateChange(state);
    }
  }

  // 错误通知
  private notifyError(error: any) {
    if (this.onError) {
      this.onError(error);
    }
  }

  // 设置回调函数
  setCallbacks(callbacks: {
    onConnectionStateChange?: (state: ConnectionState) => void;
    onError?: (error: any) => void;
  }) {
    this.onConnectionStateChange = callbacks.onConnectionStateChange || null;
    this.onError = callbacks.onError || null;
  }

  // 获取已注册的模块
  getModules() {
    return Array.from(this.modules.keys());
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

// 导出单例
export const socketCommunication = new SocketCommunication();
