import { UserSessionProvider } from '@/components/providers/user-session-provider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserSessionProvider>
      {children}
    </UserSessionProvider>
  )
}