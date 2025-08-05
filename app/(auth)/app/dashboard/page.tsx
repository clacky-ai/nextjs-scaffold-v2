import { requireUserAuth } from '@/lib/auth/utils'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const session = await requireUserAuth()

  return <DashboardContent session={session} />
}
