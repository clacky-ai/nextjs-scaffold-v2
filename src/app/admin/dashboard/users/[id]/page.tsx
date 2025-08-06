'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, Calendar, Shield, Vote, ArrowLeft, Edit, Ban, CheckCircle } from 'lucide-react'
import { AdminPageLayout } from '../../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../../components/action-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface UserDetail {
  id: string
  username: string
  name: string
  email: string
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

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

  const [user, setUser] = useState<UserDetail | null>(null)
  const [userVotes, setUserVotes] = useState<UserVote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUserDetail()
      fetchUserVotes()
    }
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const users = await response.json()
        const foundUser = users.find((u: any) => u.id === userId)
        if (foundUser) {
          setUser(foundUser)
        } else {
          toast.error('用户不存在')
        }
      }
    } catch (error) {
      console.error('获取用户详情失败:', error)
      toast.error('获取用户详情失败')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    try {
      const [votesRes, projectsRes] = await Promise.all([
        fetch('/api/admin/votes'),
        fetch('/api/admin/projects')
      ])

      if (votesRes.ok && projectsRes.ok) {
        const [votes, projects] = await Promise.all([
          votesRes.json(),
          projectsRes.json()
        ])

        // 筛选该用户的投票记录
        const userVoteRecords = votes
          .filter((vote: any) => vote.userId === userId)
          .map((vote: any) => {
            const project = projects.find((p: any) => p.id === vote.projectId)
            return {
              id: vote.id,
              projectId: vote.projectId,
              projectTitle: project?.title || '未知项目',
              createdAt: vote.createdAt
            }
          })

        setUserVotes(userVoteRecords)
      }
    } catch (error) {
      console.error('获取用户投票记录失败:', error)
    }
  }

  const handleToggleUserStatus = async () => {
    if (!user) return

    try {
      setIsUpdating(true)
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isBlocked: !user.isBlocked
        })
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null)
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
          description={`查看和管理用户 ${user.username} 的详细信息`}
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
                      <span className="text-sm text-gray-600">用户名</span>
                    </div>
                    <p className="font-medium">{user.username}</p>
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
                      <span className="text-sm text-gray-600">最后更新</span>
                    </div>
                    <p className="text-sm">
                      {new Date(user.updatedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 投票记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Vote className="h-5 w-5" />
              <span>投票记录</span>
              <Badge variant="secondary">{userVotes.length}</Badge>
            </CardTitle>
            <CardDescription>
              该用户的所有投票记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userVotes.length > 0 ? (
              <div className="space-y-3">
                {userVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{vote.projectTitle}</p>
                      <p className="text-sm text-gray-500">
                        项目ID: {vote.projectId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(vote.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">该用户还没有投票记录</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总投票数</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userVotes.length}</div>
              <p className="text-xs text-muted-foreground">
                累计投票次数
              </p>
            </CardContent>
          </Card>
          
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