import { AuthGuard } from "@/components/auth-guard";
import { UserSessionProvider } from "@/components/providers/user-session-provider";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
import { UserStoreProvider } from "@/components/providers/user-store-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserSessionProvider>
      <WebSocketProvider>
        <UserStoreProvider>
          <AuthGuard>{children}</AuthGuard>
        </UserStoreProvider>
      </WebSocketProvider>
    </UserSessionProvider>
  );
}
