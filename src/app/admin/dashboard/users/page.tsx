'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Filter } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../components/action-bar'
import { UserManagement } from '../components/user-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/admin'

export default function UsersPage() {
  const router = useRouter()
  const { 
    stats, 
    loading, 
    searchTerm,
    setSearchTerm,
    fetchUsers
  } = useUserStore()
  
  // stats is now a computed function
  const currentStats = stats()
  const isLoading = loading.fetchUsers

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleStatsUpdate = () => {
    // No need to refresh data since stats are computed automatically
    // This function can be removed or kept for compatibility
  }

  const handleUserSelect = (userId: string) => {
    router.push(`/admin/dashboard/users/${userId}`)
  }

  return (
    <AdminPageLayout breadcrumb={{ label: '用户管理', icon: Users, href: '/admin/dashboard/users' }}>
      <div className="space-y-6">
        {/* ActionBar - 标题、搜索和操作按钮 */}
        <ActionBar
          title="用户管理"
          description="管理所有注册用户"
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
                {isLoading ? '...' : currentStats.total}
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
                {isLoading ? '...' : currentStats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                正常用户
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
                {isLoading ? '...' : currentStats.blocked}
              </div>
              <p className="text-xs text-muted-foreground">
                被屏蔽的用户
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