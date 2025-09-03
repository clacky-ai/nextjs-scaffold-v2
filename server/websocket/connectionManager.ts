import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as Config from '../config';

// 连接管理器
class ConnectionManager {
  private io: SocketIOServer;
  private connections = new Map<string, Socket>(); // userId -> socket
  private userSockets = new Map<string, string>(); // socketId -> userId
  private roomSubscriptions = new Map<string, Set<string>>(); // room -> Set<socketIds>

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      path: Config.WEBSOCKET_PATH,
      cors: {
        origin: Config.WEBSOCKET_CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // 认证中间件
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          console.log('WebSocket 连接没有提供 token，允许匿名连接');
          socket.data.user = null;
          return next();
        }

        // 验证 JWT token
        const decoded = jwt.verify(token, Config.JWT_SECRET) as any;

        // 这里可以根据需要查询数据库获取用户信息
        socket.data.user = {
          id: decoded.userId || decoded.id,
          username: decoded.username,
          role: decoded.role || 'user'
        };

        console.log('WebSocket 用户认证成功:', socket.data.user);
        next();
      } catch (error) {
        console.error('WebSocket 认证失败:', error);
        // 认证失败也允许连接，但标记为匿名用户
        socket.data.user = null;
        next();
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('WebSocket 连接建立:', socket.id);

      // 注册连接
      this.handleConnection(socket);

      // 监听消息
      socket.on('message', (data) => this.handleMessage(socket, data));

      // 监听订阅
      socket.on('subscribe', (data) => this.handleSubscribe(socket, data));
      socket.on('unsubscribe', (data) => this.handleUnsubscribe(socket, data));

      // 监听房间操作
      socket.on('room:join', (data) => this.handleJoinRoom(socket, data));
      socket.on('room:leave', (data) => this.handleLeaveRoom(socket, data));

      // 监听断开连接
      socket.on('disconnect', (reason) => {
        console.log('WebSocket 连接断开:', socket.id, reason);
        this.handleDisconnection(socket);
      });

      // 心跳检测
      socket.on('heartbeat', (data) => {
        socket.emit('heartbeat', { timestamp: Date.now() });
      });
    });
  }

  private handleConnection(socket: Socket) {
    const user = socket.data.user;

    if (user) {
      // 如果用户已有连接，断开旧连接
      const existingSocket = this.connections.get(user.id);
      if (existingSocket && existingSocket.id !== socket.id) {
        existingSocket.disconnect();
      }

      // 注册新连接
      this.connections.set(user.id, socket);
      this.userSockets.set(socket.id, user.id);

      // 广播用户上线
      this.broadcastUserOnline(user);
    }
  }

  private handleDisconnection(socket: Socket) {
    const userId = this.userSockets.get(socket.id);

    if (userId) {
      const user = socket.data.user;

      // 清理连接记录
      this.connections.delete(userId);
      this.userSockets.delete(socket.id);

      // 清理房间订阅
      for (const [room, sockets] of this.roomSubscriptions.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.roomSubscriptions.delete(room);
        }
      }

      // 广播用户下线
      if (user) {
        this.broadcastUserOffline(user);
      }
    }
  }

  private handleMessage(socket: Socket, messageData: any) {
    console.log('收到客户端消息:', messageData);

    const { type, data } = messageData;

    // 根据消息类型进行不同的处理
    switch (type) {
      case 'admin:users:request_online':
        this.handleRequestOnlineUsers(socket);
        break;
      default:
        console.log(`处理消息类型: ${type}`, data);
        break;
    }
  }

  // 处理管理员请求当前在线用户列表
  private handleRequestOnlineUsers(socket: Socket) {
    console.log('管理员请求当前在线用户列表');

    const activeUsers = this.getActiveUsers();

    // 只向请求的管理员发送当前在线用户列表
    socket.emit('message', {
      type: 'users:active_update',
      timestamp: Date.now(),
      data: {
        activeUsers,
        onlineCount: activeUsers.length,
        totalUsers: 1250, // 可以从数据库获取
        timestamp: Date.now()
      }
    });

    console.log(`已向管理员发送在线用户列表，共 ${activeUsers.length} 人在线`);
  }

  private handleSubscribe(socket: Socket, { eventType }: { eventType: string }) {
    console.log(`Socket ${socket.id} 订阅事件: ${eventType}`);

    // 加入对应的房间
    socket.join(eventType);
  }

  private handleUnsubscribe(socket: Socket, { eventType }: { eventType: string }) {
    console.log(`Socket ${socket.id} 取消订阅事件: ${eventType}`);

    // 离开对应的房间
    socket.leave(eventType);
  }

  private handleJoinRoom(socket: Socket, { roomId, roomType }: { roomId: string, roomType?: string }) {
    console.log(`Socket ${socket.id} 加入房间: ${roomId} (${roomType})`);

    socket.join(roomId);

    if (!this.roomSubscriptions.has(roomId)) {
      this.roomSubscriptions.set(roomId, new Set());
    }
    this.roomSubscriptions.get(roomId)!.add(socket.id);
  }

  private handleLeaveRoom(socket: Socket, { roomId }: { roomId: string }) {
    console.log(`Socket ${socket.id} 离开房间: ${roomId}`);

    socket.leave(roomId);

    const room = this.roomSubscriptions.get(roomId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.roomSubscriptions.delete(roomId);
      }
    }
  }

  // 广播用户上线
  private broadcastUserOnline(user: any) {
    console.log('广播用户上线:', user);

    // 构建用户信息
    const userInfo = {
      userId: user.id,
      username: user.username || `用户${user.id}`,
      email: user.email || `${user.username || user.id}@example.com`,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      joinTime: Date.now(),
      lastActivity: Date.now(),
      userAgent: 'Browser',
      ipAddress: '127.0.0.1'
    };

    this.io.emit('message', {
      type: 'user:online',
      timestamp: Date.now(),
      data: {
        userId: user.id,
        username: user.username || `用户${user.id}`,
        userInfo: userInfo,
        joinTime: Date.now()
      }
    });

    // 更新在线用户列表
    this.broadcastActiveUsers();
  }

  // 广播用户下线
  private broadcastUserOffline(user: any) {
    console.log('广播用户下线:', user);

    this.io.emit('message', {
      type: 'user:offline',
      timestamp: Date.now(),
      data: {
        userId: user.id,
        username: user.username || `用户${user.id}`,
        leaveTime: Date.now(),
        reason: 'disconnect'
      }
    });

    // 更新在线用户列表
    this.broadcastActiveUsers();
  }

  // 广播在线用户列表更新
  private broadcastActiveUsers() {
    const activeUsers = this.getActiveUsers();

    console.log('广播在线用户列表更新:', activeUsers);

    this.io.emit('message', {
      type: 'users:active_update',
      timestamp: Date.now(),
      data: {
        activeUsers,
        onlineCount: activeUsers.length,
        totalUsers: 1250, // 可以从数据库获取
        timestamp: Date.now()
      }
    });
  }

  // 获取在线用户列表
  private getActiveUsers() {
    const activeUsers: any[] = [];

    this.connections.forEach((socket) => {
      if (socket.data.user) {
        const user = socket.data.user;
        activeUsers.push({
          userId: user.id,
          username: user.username || `用户${user.id}`,
          email: user.email || `${user.username || user.id}@example.com`,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          joinTime: Date.now() - Math.random() * 3600000, // 随机上线时间
          lastActivity: Date.now() - Math.random() * 300000, // 随机最后活动时间
          userAgent: 'Browser',
          ipAddress: '127.0.0.1',
          role: user.role
        });
      }
    });

    return activeUsers;
  }

  // 公共方法：广播消息到所有连接
  public broadcast(eventType: string, data: any) {
    console.log(`广播消息: ${eventType}`, data);

    this.io.emit('message', {
      type: eventType,
      timestamp: Date.now(),
      data
    });
  }

  // 公共方法：发送消息到特定用户
  public sendToUser(userId: string, eventType: string, data: any) {
    const socket = this.connections.get(userId);

    if (socket) {
      socket.emit('message', {
        type: eventType,
        timestamp: Date.now(),
        data
      });
    } else {
      console.warn(`用户 ${userId} 不在线，无法发送消息`);
    }
  }

  // 公共方法：发送消息到房间
  public sendToRoom(roomId: string, eventType: string, data: any) {
    console.log(`向房间 ${roomId} 发送消息: ${eventType}`);

    this.io.to(roomId).emit('message', {
      type: eventType,
      timestamp: Date.now(),
      data
    });
  }

  // 公共方法：获取连接统计
  public getConnectionStats() {
    return {
      totalConnections: this.io.sockets.sockets.size,
      authenticatedUsers: this.connections.size,
      activeRooms: this.roomSubscriptions.size
    };
  }

  // 公共方法：获取 Socket.IO 实例
  public getIO() {
    return this.io;
  }
}

export { ConnectionManager };
