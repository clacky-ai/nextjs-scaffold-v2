'use client'

import { OnlineUsersManagement } from '../components/online-users-management'
import { AdminPageLayout } from '../components/admin-page-layout'
import { Users } from 'lucide-react'

export default function OnlineUsersPage() {
  return (
    <AdminPageLayout
      breadcrumb={{ label: '在线用户', icon: Users }}
    >
      <OnlineUsersManagement />
    </AdminPageLayout>
  )
}