import { Server as HttpServer } from 'http';
import { ConnectionManager } from './connectionManager';

let connectionManager: ConnectionManager | null = null;

// 初始化 WebSocket 服务器
export function initializeWebSocket(httpServer: HttpServer) {
  console.log('初始化 WebSocket 服务器...');
  
  connectionManager = new ConnectionManager(httpServer);
  
  console.log('WebSocket 服务器初始化完成');
  return connectionManager;
}

// 获取 WebSocket 连接管理器实例
export function getWebSocketManager(): ConnectionManager | null {
  return connectionManager;
}

// 广播消息的便捷函数
export function broadcast(eventType: string, data: any) {
  if (connectionManager) {
    connectionManager.broadcast(eventType, data);
  } else {
    console.warn('WebSocket 管理器未初始化，无法广播消息');
  }
}

// 发送消息给特定用户的便捷函数
export function sendToUser(userId: string, eventType: string, data: any) {
  if (connectionManager) {
    connectionManager.sendToUser(userId, eventType, data);
  } else {
    console.warn('WebSocket 管理器未初始化，无法发送消息');
  }
}

// 发送消息到房间的便捷函数
export function sendToRoom(roomId: string, eventType: string, data: any) {
  if (connectionManager) {
    connectionManager.sendToRoom(roomId, eventType, data);
  } else {
    console.warn('WebSocket 管理器未初始化，无法发送消息');
  }
}

// 获取连接统计的便捷函数
export function getConnectionStats() {
  if (connectionManager) {
    return connectionManager.getConnectionStats();
  }
  
  return {
    totalConnections: 0,
    authenticatedUsers: 0,
    activeRooms: 0
  };
}