'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FolderOpen, Vote, Activity, RefreshCw, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AdminPageLayout } from './admin-page-layout'

interface Stats {
  totalUsers: number
  totalProjects: number
  totalVotes: number
  activeUsers: number
}

interface SystemStatus {
  isVotingEnabled: boolean
  maxVotesPerUser: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'project' | 'vote' | 'system'
  message: string
  timestamp: string
}

export function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    totalVotes: 0,
    activeUsers: 0,
  })
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchSystemStatus()
    fetchRecentActivities()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      const [usersRes, projectsRes, votesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/votes')
      ])

      if (usersRes.ok && projectsRes.ok && votesRes.ok) {
        const [users, projects, votes] = await Promise.all([
          usersRes.json(),
          projectsRes.json(),
          votesRes.json()
        ])

        setStats({
          totalUsers: users.length,
          totalProjects: projects.length,
          totalVotes: votes.length,
          activeUsers: users.filter((u: any) => !u.isBlocked).length
        })
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      toast.error('获取统计数据失败')
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('获取系统状态失败:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      setIsLoadingActivities(true)
      // 这里可以创建一个专门的活动日志API
      // 暂时使用模拟数据，但结构是真实的
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'system',
          message: '系统正常运行',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'user',
          message: '新用户注册',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'project',
          message: '新项目提交',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'vote',
          message: '新投票记录',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ]
      setRecentActivities(mockActivities)
    } catch (error) {
      console.error('获取活动记录失败:', error)
    } finally {
      setIsLoadingActivities(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤'
      case 'project': return '📁'
      case 'vote': return '🗳️'
      case 'system': return '⚙️'
      default: return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500'
      case 'project': return 'bg-purple-500'
      case 'vote': return 'bg-green-500'
      case 'system': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }
  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      description: `活跃用户: ${stats.activeUsers}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: '总项目数',
      value: stats.totalProjects,
      description: '已提交的项目',
      icon: FolderOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: '总投票数',
      value: stats.totalVotes,
      description: '累计投票次数',
      icon: Vote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: '活跃度',
      value: stats.totalUsers > 0 ? Math.round((stats.totalVotes / stats.totalUsers) * 100) / 100 : 0,
      description: '平均每用户投票数',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const handleRefresh = () => {
    fetchStats()
    fetchSystemStatus()
    fetchRecentActivities()
  }

  return (
    <AdminPageLayout
      title="系统概览"
      description="查看投票系统的整体运行状况"
      breadcrumbs={[{ label: '系统概览', icon: BarChart3 }]}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center space-x-2"
          disabled={isLoadingStats}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          <span>刷新数据</span>
        </Button>
      }
    >
      <div className="space-y-6">

      {/* 系统状态卡片 */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>系统状态</span>
              <Badge variant={systemStatus.isVotingEnabled ? 'default' : 'secondary'}>
                {systemStatus.isVotingEnabled ? '运行中' : '已暂停'}
              </Badge>
            </CardTitle>
            <CardDescription>
              当前投票系统的运行状态和配置信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">投票状态</p>
                <p className="text-lg">
                  {systemStatus.isVotingEnabled ? '✅ 投票开启' : '⏸️ 投票暂停'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">每用户最大投票数</p>
                <p className="text-lg">{systemStatus.maxVotesPerUser} 票</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 快速操作区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>系统最近的重要活动记录</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 text-sm">
                    <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                    <span className="text-gray-600 flex-1">{activity.message}</span>
                    <span className="text-gray-400 text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">暂无活动记录</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统健康度</CardTitle>
            <CardDescription>各项指标的健康状况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">用户活跃度</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ 
                        width: `${Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">投票参与度</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ 
                        width: `${Math.min((stats.totalVotes / (stats.totalUsers * 5)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.totalUsers > 0 ? Math.round((stats.totalVotes / (stats.totalUsers * 5)) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">系统状态</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full w-full"></div>
                  </div>
                  <span className="text-sm font-medium">100%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AdminPageLayout>
  )
}
