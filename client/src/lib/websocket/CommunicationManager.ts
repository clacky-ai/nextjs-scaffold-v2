import { socketCommunication } from './SocketCommunication';
import type { ConnectionState, WebSocketModule } from './types';

class CommunicationManager {
  private isInitialized = false;
  private modules = new Map<string, WebSocketModule>();

  // 初始化通信系统
  initialize(config: {
    url?: string;
    token?: string;
    onConnectionStateChange?: (state: ConnectionState) => void;
    onError?: (error: any) => void;
  } = {}) {
    if (this.isInitialized) {
      console.warn('CommunicationManager 已经初始化');
      return;
    }

    console.log('初始化 CommunicationManager...');

    // 设置回调
    socketCommunication.setCallbacks({
      onConnectionStateChange: config.onConnectionStateChange,
      onError: config.onError
    });

    // 初始化连接
    const wsUrl = config.url || this.getWebSocketUrl();
    socketCommunication.initialize(wsUrl, config.token);

    this.isInitialized = true;
    console.log('CommunicationManager 初始化完成');
  }

  // 获取 WebSocket URL
  private getWebSocketUrl(): string {
    // 根据当前环境自动生成 WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;

    // 开发环境
    if (import.meta.env.DEV) {
      return `http://localhost:3000`;
    }

    // 生产环境
    return `${protocol}//${host}`;
  }

  // 注册模块
  registerModule(name: string, moduleInstance: WebSocketModule) {
    this.modules.set(name, moduleInstance);
    socketCommunication.registerModule(name, moduleInstance);
    console.log(`注册模块: ${name}`);
  }

  // 注销模块
  unregisterModule(name: string) {
    this.modules.delete(name);
    socketCommunication.unregisterModule(name);
    console.log(`注销模块: ${name}`);
  }

  // 发送消息
  send(messageType: string, data?: any): boolean {
    if (!this.isInitialized) {
      console.warn('CommunicationManager 未初始化');
      return false;
    }
    
    return socketCommunication.send(messageType, data);
  }

  // 获取连接状态
  getConnectionState(): ConnectionState {
    return socketCommunication.getConnectionState();
  }

  // 检查是否已连接
  isConnected(): boolean {
    return socketCommunication.isConnected();
  }

  // 订阅事件
  subscribe(eventType: string) {
    return socketCommunication.subscribe(eventType);
  }

  // 取消订阅
  unsubscribe(eventType: string) {
    return socketCommunication.unsubscribe(eventType);
  }

  // 销毁
  destroy() {
    socketCommunication.disconnect();
    this.modules.clear();
    this.isInitialized = false;
    console.log('CommunicationManager 已销毁');
  }

  // 获取初始化状态
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // 获取已注册的模块列表
  getModules(): string[] {
    return Array.from(this.modules.keys());
  }
}

// 导出单例
export const communicationManager = new CommunicationManager();
