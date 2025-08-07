"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  useProjectStore,
  useVoteStore,
  useSystemStore,
  useUserWebSocketStore,
} from "@/stores/user";

interface UserStoreProviderProps {
  children: React.ReactNode;
}

export function UserStoreProvider({ children }: UserStoreProviderProps) {
  const { data: session, status } = useSession();
  const { fetchSettings } = useSystemStore();
  const { fetchProjects } = useProjectStore();
  const { fetchUserVotes } = useVoteStore();
  const {
    connection,
    onVoteUpdate,
    onSystemStatusUpdate,
    offVoteUpdate,
    offSystemStatusUpdate,
    setupStoreIntegrations,
  } = useUserWebSocketStore();

  // Initialize system settings (public data) when component mounts
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Initialize user-specific data when user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
      fetchUserVotes();
    }
  }, [fetchProjects, fetchUserVotes, status]);

  // Set up WebSocket integrations with other stores
  useEffect(() => {
    if (connection.isConnected) {
      setupStoreIntegrations();

      // Set up vote update handler
      onVoteUpdate((data) => {
        // Update project vote count in project store
        const { updateProjectVoteCount } = useProjectStore.getState();
        updateProjectVoteCount(data.projectId, data.newVoteCount);

        // Show toast notification
        toast.success(`${data.voterName} 给 "${data.projectTitle}" 投了一票！`);
      });

      // Set up system status update handler
      onSystemStatusUpdate((data) => {
        // Update system settings in system store
        const { updateSettings } = useSystemStore.getState();
        updateSettings(data);

        // Show toast notification
        toast.info(
          `系统状态已更新: ${data.isVotingEnabled ? "投票开启" : "投票暂停"}`
        );
      });

      return () => {
        offVoteUpdate();
        offSystemStatusUpdate();
      };
    }
  }, [
    connection.isConnected,
    onVoteUpdate,
    onSystemStatusUpdate,
    offVoteUpdate,
    offSystemStatusUpdate,
    setupStoreIntegrations,
  ]);

  return <>{children}</>;
}
