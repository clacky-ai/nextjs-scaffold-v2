import { AuthGuard } from '@/components/auth-guard'
import { UserSessionProvider } from '@/components/providers/user-session-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserSessionProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </UserSessionProvider>
  )
}
