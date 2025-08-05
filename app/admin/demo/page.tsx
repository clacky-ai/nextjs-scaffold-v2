'use client'

import { useState } from 'react'
import { AdminSidebar } from '../dashboard/components/admin-sidebar'
import { Overview } from '../dashboard/components/overview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 模拟数据
const mockSession = {
  user: {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@voting-system.com'
  }
}

const mockStats = {
  totalUsers: 156,
  totalProjects: 23,
  totalVotes: 892,
  activeUsers: 134
}

const mockSystemStatus = {
  isVotingEnabled: true,
  maxVotesPerUser: 5
}

export default function AdminDemoPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview stats={mockStats} systemStatus={mockSystemStatus} />
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>
                管理所有注册用户，可以屏蔽或恢复用户的投票权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">用户管理功能演示</p>
                <p className="text-sm text-gray-400 mt-2">这里会显示用户列表和管理操作</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'projects':
        return (
          <Card>
            <CardHeader>
              <CardTitle>项目管理</CardTitle>
              <CardDescription>
                管理所有提交的项目，可以屏蔽或恢复项目的投票资格
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">项目管理功能演示</p>
                <p className="text-sm text-gray-400 mt-2">这里会显示项目列表和管理操作</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'votes':
        return (
          <Card>
            <CardHeader>
              <CardTitle>投票管理</CardTitle>
              <CardDescription>
                查看和管理所有投票记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">投票管理功能演示</p>
                <p className="text-sm text-gray-400 mt-2">这里会显示投票记录和管理操作</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>系统设置</CardTitle>
              <CardDescription>
                管理投票系统的全局设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">系统设置功能演示</p>
                <p className="text-sm text-gray-400 mt-2">这里会显示系统配置选项</p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return <Overview stats={mockStats} systemStatus={mockSystemStatus} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* 侧边栏 */}
      <AdminSidebar
        session={mockSession}
        systemStatus={mockSystemStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {activeTab === 'overview' && '系统概览'}
                {activeTab === 'users' && '用户管理'}
                {activeTab === 'projects' && '项目管理'}
                {activeTab === 'votes' && '投票管理'}
                {activeTab === 'settings' && '系统设置'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                管理员仪表板 - 响应式左右布局演示
              </p>
            </div>
            <div className="hidden md:block text-sm text-gray-500">
              当前选中: {activeTab}
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
