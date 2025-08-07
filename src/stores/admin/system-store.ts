import { create } from "zustand";
import { SystemSettings, LoadingState } from "./types";
import { toast } from "sonner";

interface SystemStore {
  // State
  settings: SystemSettings;
  loading: LoadingState;

  // Actions
  setSettings: (settings: SystemSettings) => void;
  setLoading: (key: string, loading: boolean) => void;

  // API Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<boolean>;
  toggleVoting: () => Promise<boolean>;
  updateMaxVotes: (maxVotes: number) => Promise<boolean>;

  // Getters
  isVotingEnabled: () => boolean;
  getMaxVotesPerUser: () => number;
  refreshData: () => Promise<void>;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  // Initial state
  settings: {
    isVotingEnabled: false,
    maxVotesPerUser: 3,
  },
  loading: {},

  // Basic actions
  setSettings: (settings) => set({ settings }),
  setLoading: (key, loading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: loading },
    })),

  // API actions
  fetchSettings: async () => {
    const { setLoading, setSettings, loading } = get();

    // Prevent duplicate requests
    if (loading.fetchSettings) {
      return;
    }

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

  updateSettings: async (newSettings) => {
    const { setLoading, settings, setSettings } = get();

    try {
      setLoading("updateSettings", true);

      // 调用真正的 API 更新数据库状态
      const response = await fetch("/api/admin/system/voting", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新失败");
      }

      const result = await response.json();

      // 更新本地状态
      const updatedSettings = {
        ...settings,
        isVotingEnabled: result.data.isVotingEnabled,
        maxVotesPerUser: result.data.maxVotesPerUser,
      };
      setSettings(updatedSettings);

      toast.success("系统设置已更新");
      return true;
    } catch (error) {
      console.error("更新设置失败:", error);
      toast.error(error instanceof Error ? error.message : "更新设置失败");
      return false;
    } finally {
      setLoading("updateSettings", false);
    }
  },

  toggleVoting: async () => {
    const { settings } = get();
    const newVotingEnabled = !settings.isVotingEnabled;

    const success = await get().updateSettings({
      isVotingEnabled: newVotingEnabled,
    });

    if (success) {
      toast.success(newVotingEnabled ? "投票功能已开启" : "投票功能已关闭");
    }

    return success;
  },

  updateMaxVotes: async (maxVotesPerUser) => {
    const success = await get().updateSettings({
      maxVotesPerUser,
    });

    if (success) {
      toast.success(`最大投票数已更新为 ${maxVotesPerUser}`);
    }

    return success;
  },

  // Getters
  isVotingEnabled: () => {
    return get().settings.isVotingEnabled;
  },

  getMaxVotesPerUser: () => {
    return get().settings.maxVotesPerUser;
  },

  refreshData: async () => {
    await get().fetchSettings();
  },
}));
