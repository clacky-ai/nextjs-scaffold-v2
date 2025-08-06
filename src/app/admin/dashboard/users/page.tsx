'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Filter } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../components/action-bar'
import { UserManagement } from '../components/user-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStats {
  total: number
  active: number
  blocked: number
}

export default function UsersPage() {
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    blocked: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const users = await response.json()
        setUserStats({
          total: users.length,
          active: users.filter((u: any) => !u.isBlocked).length,
          blocked: users.filter((u: any) => u.isBlocked).length
        })
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatsUpdate = () => {
    fetchUserStats()
  }

  const handleUserSelect = (userId: string) => {
    router.push(`/admin/dashboard/users/${userId}`)
  }

  return (
    <AdminPageLayout
      breadcrumbs={[{ label: '用户管理', icon: Users, href: '/admin/dashboard/users' }]}
    >
      <div className="space-y-6">
        {/* ActionBar - 标题、搜索和操作按钮 */}
        <ActionBar
          title="用户管理"
          description="管理所有注册用户，可以屏蔽或恢复用户的投票权限"
          showSearch={true}
          searchPlaceholder="搜索用户名、邮箱或姓名..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          actions={
            <>
              <ActionBarButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </ActionBarButton>
              <ActionBarButton>
                <UserPlus className="h-4 w-4 mr-2" />
                添加用户
              </ActionBarButton>
            </>
          }
        />
        {/* 用户统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : userStats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                注册用户总数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : userStats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                可正常投票的用户
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">被屏蔽用户</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? '...' : userStats.blocked}
              </div>
              <p className="text-xs text-muted-foreground">
                被屏蔽无法投票的用户
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 用户管理组件 */}
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>
              管理所有注册用户的状态和权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagement
              onStatsUpdate={handleStatsUpdate}
              onUserSelect={handleUserSelect}
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}