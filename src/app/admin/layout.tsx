import { AdminSessionProvider } from '@/components/providers/admin-session-provider'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminSessionProvider>
      {children}
    </AdminSessionProvider>
  )
}