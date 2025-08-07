export interface User {
  id: string
  name: string
  email: string
  phone?: string
  team?: string
  isBlocked: boolean
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  imageUrl?: string
  videoUrl?: string
  demoUrl?: string
  githubUrl?: string
  authorId: string
  authorName: string
  isBlocked: boolean
  voteCount: number
  createdAt: string
}

export interface Vote {
  id: string
  userId: string
  projectId: string
  reason: string
  userName: string
  projectTitle: string
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

export interface SystemSettings {
  isVotingEnabled: boolean
  maxVotesPerUser: number
}

export interface UserStats {
  total: number
  active: number
  blocked: number
}

export interface ProjectStats {
  total: number
  active: number
  blocked: number
}

export interface VoteStats {
  total: number
  todayVotes: number
  averageVotesPerProject: number
}

export interface LoadingState {
  [key: string]: boolean
}

export interface MenuItem {
  id: string
  label: string
  path: string
  icon: any
}