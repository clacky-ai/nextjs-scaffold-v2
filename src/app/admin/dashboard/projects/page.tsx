'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, Plus, Search, Filter, Eye } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../components/action-bar'
import { ProjectManagement } from '../components/project-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore, useVoteStore } from '@/stores/admin'

export default function ProjectsPage() {
  const {
    stats: projectStats,
    loading: projectLoading,
    searchTerm,
    setSearchTerm,
    fetchProjects
  } = useProjectStore()
  
  const {
    stats: voteStats,
    fetchVotes
  } = useVoteStore()
  
  const [searchTermLocal, setSearchTermLocal] = useState('')
  
  // Computed stats including votes
  const currentProjectStats = projectStats()
  const currentVoteStats = voteStats()
  const isLoading = projectLoading.fetchProjects

  useEffect(() => {
    fetchProjects()
    fetchVotes() // Also fetch votes for totalVotes display
  }, [])

  const handleStatsUpdate = () => {
    // Stats are computed automatically, no need for manual refresh
  }

  return (
    <AdminPageLayout breadcrumb={{ label: '项目管理', icon: FolderOpen }}>
      <div className="space-y-6">
        {/* ActionBar - 标题、搜索和操作按钮 */}
        <ActionBar
          title="项目管理"
          description="管理所有提交的项目，可以屏蔽或恢复项目的投票资格"
          showSearch={true}
          searchPlaceholder="搜索项目标题、描述或提交者..."
          searchValue={searchTermLocal}
          onSearchChange={setSearchTermLocal}
          actions={
            <>
              <ActionBarButton variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                预览模式
              </ActionBarButton>
              <ActionBarButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </ActionBarButton>
              <ActionBarButton>
                <Plus className="h-4 w-4 mr-2" />
                添加项目
              </ActionBarButton>
            </>
          }
        />
        {/* 项目统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总项目数</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : currentProjectStats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                提交的项目总数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃项目</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : currentProjectStats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                可正常投票的项目
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">被屏蔽项目</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? '...' : currentProjectStats.blocked}
              </div>
              <p className="text-xs text-muted-foreground">
                被屏蔽无法投票的项目
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总投票数</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : currentVoteStats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                所有项目获得的投票
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 项目管理组件 */}
        <Card>
          <CardHeader>
            <CardTitle>项目列表</CardTitle>
            <CardDescription>
              管理所有提交项目的状态和可见性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectManagement
              onStatsUpdate={handleStatsUpdate}
              searchTerm={searchTermLocal}
            />
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}