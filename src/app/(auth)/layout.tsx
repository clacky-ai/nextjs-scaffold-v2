import { AuthGuard } from '@/components/auth-guard'
import { UserSessionProvider } from '@/components/providers/user-session-provider'
import { WebSocketProvider } from '@/components/providers/websocket-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserSessionProvider>
      <WebSocketProvider>
        <AuthGuard>
          {children}
        </AuthGuard>
      </WebSocketProvider>
    </UserSessionProvider>
  )
}
