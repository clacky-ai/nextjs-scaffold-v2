'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, Calendar, Shield, Vote, ArrowLeft, Edit, Ban, CheckCircle } from 'lucide-react'
import { AdminPageLayout } from '../../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../../components/action-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/admin'
import { User as UserType } from '@/stores/admin/types'

interface UserVote {
  id: string
  projectId: string
  projectTitle: string
  createdAt: string
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  const { users, fetchUsers, toggleUserStatus, loading: userLoading } = useUserStore()
  const [isUpdating, setIsUpdating] = useState(false)

  // 从 stores 中获取用户数据
  const user = useMemo(() => 
    users.find((u: UserType) => u.id === userId) || null, 
    [users, userId]
  )

  const isLoading = userLoading.fetchUsers;

  useEffect(() => {
    // 获取所有需要的数据
    fetchUsers()
  }, [])

  const handleToggleUserStatus = async () => {
    if (!user) return

    try {
      setIsUpdating(true)
      const success = await toggleUserStatus(user.id, !user.isBlocked)
      if (success) {
        toast.success(user.isBlocked ? '用户已解除屏蔽' : '用户已屏蔽')
      } else {
        toast.error('操作失败')
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      toast.error('操作失败')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBack = () => {
    router.push('/admin/dashboard/users')
  }

  if (isLoading) {
    return (
      <AdminPageLayout breadcrumb={{ label: '用户详情' }}>
        <ActionBar
          title="用户详情"
          description="加载中..."
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageLayout>
    )
  }

  if (!user) {
    return (
      <AdminPageLayout breadcrumb={{ label: '用户详情' }}>
        <ActionBar
          title="用户详情"
          description="用户不存在"
          actions={
            <ActionBarButton variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回用户列表
            </ActionBarButton>
          }
        />
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">用户不存在或已被删除</p>
          </CardContent>
        </Card>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout breadcrumb={{ label: '用户详情', icon: User }}>
      <div className="space-y-6">
        {/* ActionBar - 标题和操作按钮 */}
        <ActionBar
          title={`用户详情 - ${user.name}`}
          description={`查看和管理用户 ${user.name} 的详细信息`}
          actions={
            <>
              <ActionBarButton variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </ActionBarButton>
              <ActionBarButton variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                编辑用户
              </ActionBarButton>
              <ActionBarButton
                variant={user.isBlocked ? "default" : "destructive"}
                onClick={handleToggleUserStatus}
                disabled={isUpdating}
              >
                {user.isBlocked ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    解除屏蔽
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    屏蔽用户
                  </>
                )}
              </ActionBarButton>
            </>
          }
        />
        
        {/* 用户基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>用户的基本资料和账户状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">用户ID</span>
                    </div>
                    <p className="font-medium">{user.id}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">姓名</span>
                    </div>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">邮箱</span>
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">账户状态</span>
                    </div>
                    <Badge variant={user.isBlocked ? "destructive" : "default"}>
                      {user.isBlocked ? "已屏蔽" : "正常"}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">注册时间</span>
                    </div>
                    <p className="text-sm">
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">账户状态</span>
                    </div>
                    <p className="text-sm">
                      {user.isBlocked ? '已屏蔽' : '正常'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">账户状态</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.isBlocked ? "受限" : "正常"}
              </div>
              <p className="text-xs text-muted-foreground">
                当前账户状态
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">注册天数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <p className="text-xs text-muted-foreground">
                注册至今天数
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  )
}