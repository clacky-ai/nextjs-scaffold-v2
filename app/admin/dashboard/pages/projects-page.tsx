'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Search, Filter, Eye } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { ProjectManagement } from '../components/project-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectStats {
  total: number
  active: number
  blocked: number
  totalVotes: number
}

export function ProjectsPage() {
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    blocked: 0,
    totalVotes: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjectStats()
  }, [])

  const fetchProjectStats = async () => {
    try {
      setIsLoading(true)
      const [projectsRes, votesRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/votes')
      ])

      if (projectsRes.ok && votesRes.ok) {
        const [projects, votes] = await Promise.all([
          projectsRes.json(),
          votesRes.json()
        ])

        setProjectStats({
          total: projects.length,
          active: projects.filter((p: any) => !p.isBlocked).length,
          blocked: projects.filter((p: any) => p.isBlocked).length,
          totalVotes: votes.length
        })
      }
    } catch (error) {
      console.error('获取项目统计失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatsUpdate = () => {
    fetchProjectStats()
  }

  return (
    <AdminPageLayout
      title="项目管理"
      description="管理所有提交的项目，可以屏蔽或恢复项目的投票资格"
      breadcrumbs={[{ label: '项目管理', icon: FolderOpen }]}
      actions={
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            预览模式
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加项目
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 项目统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总项目数</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : projectStats.total}
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
                {isLoading ? '...' : projectStats.active}
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
                {isLoading ? '...' : projectStats.blocked}
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
                {isLoading ? '...' : projectStats.totalVotes}
              </div>
              <p className="text-xs text-muted-foreground">
                所有项目获得的投票
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>搜索项目</CardTitle>
            <CardDescription>
              通过项目标题、描述或提交者搜索项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索项目..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 项目管理组件 */}
        <Card>
          <CardHeader>
            <CardTitle>项目列表</CardTitle>
            <CardDescription>
              管理所有提交项目的状态和可见性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectManagement onStatsUpdate={handleStatsUpdate} />
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}
