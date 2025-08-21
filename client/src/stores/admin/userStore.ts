import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, LoadingState } from './types';

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
      const data = await api.get('/api/admin/users');
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
      await api.patch(`/api/admin/users/${userId}/status`, { isBlocked });

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
}));
