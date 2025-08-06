import { AdminAuthGuard } from '@/components/admin-auth-guard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      {children}
    </AdminAuthGuard>
  )
}
