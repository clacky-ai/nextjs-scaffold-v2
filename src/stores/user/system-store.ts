import { create } from "zustand";
import { SystemSettings, LoadingState } from "./types";

interface SystemStore {
  // State
  settings: SystemSettings;
  loading: LoadingState;

  // Actions
  setSettings: (settings: SystemSettings) => void;
  setLoading: (key: string, loading: boolean) => void;

  // API Actions
  fetchSettings: () => Promise<void>;

  // Real-time updates
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Getters
  isVotingEnabled: () => boolean;
  getMaxVotesPerUser: () => number;
  refreshData: () => Promise<void>;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  // Initial state
  settings: {
    isVotingEnabled: true,
    maxVotesPerUser: 3,
  },
  loading: {},

  // Basic actions
  setSettings: (settings) => set({ settings }),
  setLoading: (key, loading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: loading },
    })),

  // API Actions
  fetchSettings: async () => {
    const { setLoading, setSettings } = get();

    try {
      setLoading("fetchSettings", true);

      // 从 API 获取真实的系统状态
      const response = await fetch("/api/system/status");
      if (response.ok) {
        const systemStatus = await response.json();
        setSettings({
          isVotingEnabled: systemStatus.isVotingEnabled,
          maxVotesPerUser: systemStatus.maxVotesPerUser,
        });
      } else {
        // API 失败时使用默认设置
        const defaultSettings = {
          isVotingEnabled: true,
          maxVotesPerUser: 3,
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("获取系统设置失败:", error);
      // 网络错误时使用默认设置
      const defaultSettings = {
        isVotingEnabled: true,
        maxVotesPerUser: 3,
      };
      setSettings(defaultSettings);
    } finally {
      setLoading("fetchSettings", false);
    }
  },

  // Real-time updates
  updateSettings: (newSettings) => {
    const { settings, setSettings } = get();
    setSettings({ ...settings, ...newSettings });
  },

  // Getters
  isVotingEnabled: () => {
    const { settings } = get();
    return settings.isVotingEnabled;
  },

  getMaxVotesPerUser: () => {
    const { settings } = get();
    return settings.maxVotesPerUser;
  },

  refreshData: async () => {
    await get().fetchSettings();
  },
}));
