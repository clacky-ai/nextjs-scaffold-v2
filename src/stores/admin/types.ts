export interface User {
  id: string
  name: string
  email: string
  phone?: string
  team?: string
  isBlocked: boolean
  createdAt: string
}

export interface OnlineUser {
  userId: string
  userName: string
  userEmail: string
  socketId: string
  connectedAt: string
  lastActivity: string
  isActive: boolean
}

export interface UserStats {
  total: number
  active: number
  blocked: number
}

export interface LoadingState {
  [key: string]: boolean
}

export interface MenuItem {
  id: string
  label: string
  path: string
  icon: any
  description?: string
}

export interface AdminMessageData {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  from: string
  timestamp: number
}

export interface WebSocketConnectionState {
  isConnected: boolean
  isAuthenticated: boolean
  reconnectAttempts: number
  lastConnectedAt?: Date
}