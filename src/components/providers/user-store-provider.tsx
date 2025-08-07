"use client";

import { useSession } from "next-auth/react";
import {
  useUserWebSocketStore,
} from "@/stores/user";

interface UserStoreProviderProps {
  children: React.ReactNode;
}

export function UserStoreProvider({ children }: UserStoreProviderProps) {
  const { data: session, status } = useSession();
  const {
    connection,
  } = useUserWebSocketStore();

  return <>{children}</>;
}
