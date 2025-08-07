export interface AdminMessageData {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  from: string
  timestamp: number
}

export interface VoteUpdateData {
  projectId: string
  projectTitle: string
  newVoteCount: number
  voterName: string
}

export interface SystemStatusUpdateData {
  isVotingEnabled: boolean
  maxVotesPerUser: number
}

export interface WebSocketConnectionState {
  isConnected: boolean
  isAuthenticated: boolean
  reconnectAttempts: number
  lastConnectedAt?: Date
}

export interface LoadingState {
  [key: string]: boolean
}