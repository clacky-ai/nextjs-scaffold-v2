import { UserSessionProvider } from '@/components/providers/user-session-provider'
import { WebSocketProvider } from '@/components/providers/websocket-provider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserSessionProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </UserSessionProvider>
  )
}