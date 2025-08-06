'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AdminSidebar } from './components/admin-sidebar'
import { OverviewPage } from './components/overview'
import { UsersPage } from './pages/users-page'
import { ProjectsPage } from './pages/projects-page'
import { VotesPage } from './pages/votes-page'
import { SettingsPage } from './pages/settings-page'


export function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview')

  // 导航处理函数
  const handleNavigateToTab = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigateToTab} />
      case 'users':
        return <UsersPage onNavigate={handleNavigateToTab} />
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigateToTab} />
      case 'votes':
        return <VotesPage onNavigate={handleNavigateToTab} />
      case 'settings':
        return <SettingsPage onNavigate={handleNavigateToTab} />
      default:
        return <OverviewPage onNavigate={handleNavigateToTab} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 主内容区域 */}
      {renderContent()}
    </div>
  )
}
