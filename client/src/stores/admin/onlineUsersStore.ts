import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OnlineUserData } from '@/ws-modules/admin';

// 在线用户统计数据
interface OnlineUsersStats {
  totalOnline: number;
  totalRegistered: number;
  peakOnlineToday: number;
  averageSessionTime: number;
  newUsersToday: number;
}

// 在线用户过滤和排序选项
interface OnlineUsersFilters {
  searchQuery: string;
  sortBy: 'username' | 'joinTime' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
  showOnlyActive: boolean;
}

// Store 状态接口
interface OnlineUsersState {
  // 在线用户数据
  onlineUsers: OnlineUserData[];
  onlineCount: number;
  totalUsers: number;
  lastUpdated: number;
  
  // 统计数据
  stats: OnlineUsersStats;
  
  // 过滤和排序
  filters: OnlineUsersFilters;
  
  // UI 状态
  isLoading: boolean;
  error: string | null;
  selectedUserId: string | null;
}

// Store Actions 接口
interface OnlineUsersActions {
  // 数据更新
  setOnlineUsers: (users: OnlineUserData[]) => void;
  addOnlineUser: (user: OnlineUserData) => void;
  removeOnlineUser: (userId: string) => void;
  updateOnlineUser: (userId: string, updates: Partial<OnlineUserData>) => void;
  setOnlineCount: (count: number) => void;
  setTotalUsers: (count: number) => void;
  updateLastUpdated: () => void;
  
  // 统计数据
  updateStats: (stats: Partial<OnlineUsersStats>) => void;
  
  // 过滤和排序
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: OnlineUsersFilters['sortBy']) => void;
  setSortOrder: (order: OnlineUsersFilters['sortOrder']) => void;
  toggleShowOnlyActive: () => void;
  resetFilters: () => void;
  
  // UI 状态
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedUserId: (userId: string | null) => void;
  
  // 工具方法
  getFilteredUsers: () => OnlineUserData[];
  getUserById: (userId: string) => OnlineUserData | undefined;
  clearAllData: () => void;
}

type OnlineUsersStore = OnlineUsersState & OnlineUsersActions;

// 初始状态
const initialState: OnlineUsersState = {
  onlineUsers: [],
  onlineCount: 0,
  totalUsers: 0,
  lastUpdated: 0,
  stats: {
    totalOnline: 0,
    totalRegistered: 0,
    peakOnlineToday: 0,
    averageSessionTime: 0,
    newUsersToday: 0,
  },
  filters: {
    searchQuery: '',
    sortBy: 'joinTime',
    sortOrder: 'desc',
    showOnlyActive: false,
  },
  isLoading: false,
  error: null,
  selectedUserId: null,
};

export const useOnlineUsersStore = create<OnlineUsersStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 数据更新方法
    setOnlineUsers: (users: OnlineUserData[]) => {
      set({
        onlineUsers: users,
        onlineCount: users.length,
        lastUpdated: Date.now(),
      });
    },

    addOnlineUser: (user: OnlineUserData) => {
      set((state) => {
        const existingIndex = state.onlineUsers.findIndex(u => u.userId === user.userId);
        if (existingIndex >= 0) {
          // 更新现有用户
          const updatedUsers = [...state.onlineUsers];
          updatedUsers[existingIndex] = user;
          return {
            onlineUsers: updatedUsers,
            lastUpdated: Date.now(),
          };
        } else {
          // 添加新用户
          return {
            onlineUsers: [...state.onlineUsers, user],
            onlineCount: state.onlineCount + 1,
            lastUpdated: Date.now(),
          };
        }
      });
    },

    removeOnlineUser: (userId: string) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter(user => user.userId !== userId),
        onlineCount: Math.max(0, state.onlineCount - 1),
        lastUpdated: Date.now(),
        selectedUserId: state.selectedUserId === userId ? null : state.selectedUserId,
      }));
    },

    updateOnlineUser: (userId: string, updates: Partial<OnlineUserData>) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.map(user =>
          user.userId === userId ? { ...user, ...updates } : user
        ),
        lastUpdated: Date.now(),
      }));
    },

    setOnlineCount: (count: number) => {
      set({ onlineCount: count });
    },

    setTotalUsers: (count: number) => {
      set({ totalUsers: count });
    },

    updateLastUpdated: () => {
      set({ lastUpdated: Date.now() });
    },

    // 统计数据方法
    updateStats: (stats: Partial<OnlineUsersStats>) => {
      set((state) => ({
        stats: { ...state.stats, ...stats }
      }));
    },

    // 过滤和排序方法
    setSearchQuery: (query: string) => {
      set((state) => ({
        filters: { ...state.filters, searchQuery: query }
      }));
    },

    setSortBy: (sortBy: OnlineUsersFilters['sortBy']) => {
      set((state) => ({
        filters: { ...state.filters, sortBy }
      }));
    },

    setSortOrder: (order: OnlineUsersFilters['sortOrder']) => {
      set((state) => ({
        filters: { ...state.filters, sortOrder: order }
      }));
    },

    toggleShowOnlyActive: () => {
      set((state) => ({
        filters: { ...state.filters, showOnlyActive: !state.filters.showOnlyActive }
      }));
    },

    resetFilters: () => {
      set({
        filters: { ...initialState.filters }
      });
    },

    // UI 状态方法
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setSelectedUserId: (userId: string | null) => {
      set({ selectedUserId: userId });
    },

    // 工具方法
    getFilteredUsers: () => {
      const { onlineUsers, filters } = get();
      let filtered = [...onlineUsers];

      // 搜索过滤
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      }

      // 活跃用户过滤
      if (filters.showOnlyActive) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        filtered = filtered.filter(user => user.lastActivity > fiveMinutesAgo);
      }

      // 排序
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'username':
            aValue = a.username.toLowerCase();
            bValue = b.username.toLowerCase();
            break;
          case 'joinTime':
            aValue = a.joinTime;
            bValue = b.joinTime;
            break;
          case 'lastActivity':
            aValue = a.lastActivity;
            bValue = b.lastActivity;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    },

    getUserById: (userId: string) => {
      return get().onlineUsers.find(user => user.userId === userId);
    },

    clearAllData: () => {
      set(initialState);
    },
  }))
);

// 便捷的 selector hooks
export const useOnlineUsers = () =>
  useOnlineUsersStore(state => {
    const { onlineUsers, filters } = state;
    let filtered = [...onlineUsers];

    // 搜索过滤
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    // 活跃用户过滤
    if (filters.showOnlyActive) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      filtered = filtered.filter(user => user.lastActivity > fiveMinutesAgo);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'username':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'joinTime':
          aValue = a.joinTime;
          bValue = b.joinTime;
          break;
        case 'lastActivity':
          aValue = a.lastActivity;
          bValue = b.lastActivity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

export const useOnlineUsersCount = () => 
  useOnlineUsersStore(state => state.onlineCount);

export const useOnlineUsersStats = () => 
  useOnlineUsersStore(state => state.stats);

export const useOnlineUsersFilters = () => 
  useOnlineUsersStore(state => state.filters);

export const useSelectedOnlineUser = () => 
  useOnlineUsersStore(state => {
    const selectedId = state.selectedUserId;
    return selectedId ? state.getUserById(selectedId) : null;
  });
