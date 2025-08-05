import { requireCustomAdminAuth } from '@/lib/auth/utils'
import { AdminDashboardContent } from './admin-dashboard-content'

export default async function AdminDashboardPage() {
  const session = await requireCustomAdminAuth()

  return <AdminDashboardContent session={session} />
}
