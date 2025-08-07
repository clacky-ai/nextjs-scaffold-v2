export interface AdminMessageData {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  from: string;
  timestamp: number;
}

export interface VoteUpdateData {
  projectId: string;
  projectTitle: string;
  newVoteCount: number;
  voterName: string;
}

export interface SystemStatusUpdateData {
  isVotingEnabled: boolean;
  maxVotesPerUser: number;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isAuthenticated: boolean;
  reconnectAttempts: number;
  lastConnectedAt?: Date;
}

export interface LoadingState {
  [key: string]: boolean;
}

// User-side specific types
export interface Project {
  id: string;
  title: string;
  description: string;
  teamMembers: string;
  demoLink?: string;
  category?: string;
  tags?: string;
  submitterName: string;
  submitterId: string;
  voteCount: number;
  createdAt: string;
  isBlocked?: boolean;
}

export interface Vote {
  id: string;
  projectId: string;
  userId: string;
  reason: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
  };
}

export interface SystemSettings {
  isVotingEnabled: boolean;
  maxVotesPerUser: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  team?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface ProjectStats {
  total: number;
  myProjects: number;
  votedProjects: number;
}

export interface VoteStats {
  totalVotes: number;
  remainingVotes: number;
  myVotes: number;
}
