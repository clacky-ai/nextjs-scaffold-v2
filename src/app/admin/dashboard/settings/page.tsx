'use client'

import { useState } from 'react'
import { Settings, Key, Users, RefreshCw } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { ActionBar, ActionBarButton } from '../components/action-bar'
import { PasswordChangeForm } from '../components/password-change-form'
import { AdminManagement } from '../components/admin-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'admins'>('password')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <AdminPageLayout breadcrumb={{ label: '管理员设置', icon: Settings }}>
      <div className="space-y-6">
        {/* ActionBar - 标题和操作按钮 */}
        <ActionBar
          title="管理员设置"
          description="管理管理员账号和个人设置"
          actions={
            <>
              <ActionBarButton variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </ActionBarButton>
            </>
          }
        />
        {/* 功能选择卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeTab === 'password' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveTab('password')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">修改密码</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">个人设置</div>
              <p className="text-xs text-muted-foreground">
                修改当前管理员账号的密码
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeTab === 'admins' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveTab('admins')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理员管理</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">账号管理</div>
              <p className="text-xs text-muted-foreground">
                管理所有管理员账号的增删改查
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 功能内容区域 */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>
                修改当前管理员账号的登录密码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        )}

        {activeTab === 'admins' && (
          <Card>
            <CardHeader>
              <CardTitle>管理员管理</CardTitle>
              <CardDescription>
                管理所有管理员账号，包括创建、编辑和删除操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminManagement key={refreshKey} />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  )
}