'use client'

import { useState } from 'react'
import { AdminSidebar } from './components/admin-sidebar'
import { OverviewPage } from './components/overview'
import { UsersPage } from './pages/users-page'
import { ProjectsPage } from './pages/projects-page'
import { VotesPage } from './pages/votes-page'
import { SettingsPage } from './pages/settings-page'

interface AdminDashboardContentProps {
  session: {
    user: {
      id: string
      username: string
      name: string
      email: string
    }
  }
}

export function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />
      case 'users':
        return <UsersPage />
      case 'projects':
        return <ProjectsPage />
      case 'votes':
        return <VotesPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <OverviewPage />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <AdminSidebar
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 主内容区域 */}
      {renderContent()}
    </div>
  )
}
