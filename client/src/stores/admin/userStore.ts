import { create } from 'zustand';
import { User, UserStats, LoadingState } from './types';

interface UserStore {
  // State
  users: User[];
  loading: LoadingState;
  searchTerm: string;
  
  // Actions
  setUsers: (users: User[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  
  // API Actions
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string, isBlocked: boolean) => Promise<boolean>;
  
  // Computed
  stats: () => UserStats;
  filteredUsers: () => User[];
  refreshData: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  loading: {},
  searchTerm: '',
  
  // Basic actions
  setUsers: (users) => set({ users }),
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  // API actions
  fetchUsers: async () => {
    const { setLoading, setUsers, loading } = get();
    
    // Prevent duplicate requests
    if (loading.fetchUsers) {
      return;
    }
    
    try {
      setLoading('fetchUsers', true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // You can add toast notification here if needed
    } finally {
      setLoading('fetchUsers', false);
    }
  },
  
  toggleUserStatus: async (userId: string, isBlocked: boolean) => {
    const { setLoading, users, setUsers } = get();
    
    try {
      setLoading('toggleUserStatus', true);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isBlocked }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, isBlocked } : user
      );
      setUsers(updatedUsers);
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    } finally {
      setLoading('toggleUserStatus', false);
    }
  },
  
  // Computed properties
  stats: () => {
    const { users } = get();
    const total = users.length;
    const blocked = users.filter(user => user.isBlocked).length;
    const active = total - blocked;
    
    return { total, active, blocked };
  },
  
  filteredUsers: () => {
    const { users, searchTerm } = get();
    
    if (!searchTerm) {
      return users;
    }
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.team && user.team.toLowerCase().includes(term))
    );
  },
  
  refreshData: async () => {
    const { fetchUsers } = get();
    await fetchUsers();
  }
}));
