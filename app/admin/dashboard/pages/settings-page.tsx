'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Shield, Database } from 'lucide-react'
import { AdminPageLayout } from '../components/admin-page-layout'
import { SystemSettings } from '../components/system-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SystemStatus {
  isVotingEnabled: boolean
  maxVotesPerUser: number
  createdAt: string
  updatedAt: string
}

export function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('获取系统状态失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = () => {
    fetchSystemStatus()
  }

  const handleBackup = () => {
    // 这里可以实现数据备份功能
    console.log('执行数据备份')
  }

  const handleRestore = () => {
    // 这里可以实现数据恢复功能
    console.log('执行数据恢复')
  }

  return (
    <AdminPageLayout
      title="系统设置"
      description="管理投票系统的全局设置和配置"
      breadcrumbs={[{ label: '系统设置', icon: Settings }]}
      actions={
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleBackup}>
            <Database className="h-4 w-4 mr-2" />
            备份数据
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSystemStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 系统状态概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">投票状态</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={systemStatus?.isVotingEnabled ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {isLoading ? '加载中...' : (systemStatus?.isVotingEnabled ? '开启' : '关闭')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                当前投票系统状态
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">投票限制</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : systemStatus?.maxVotesPerUser || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                每用户最大投票数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最后更新</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {isLoading ? '...' : (
                  systemStatus?.updatedAt 
                    ? new Date(systemStatus.updatedAt).toLocaleString('zh-CN')
                    : '未知'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                系统设置更新时间
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 系统配置 */}
        <Card>
          <CardHeader>
            <CardTitle>投票系统配置</CardTitle>
            <CardDescription>
              管理投票系统的核心设置和参数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemSettings 
              onStatusUpdate={handleStatusUpdate}
              currentStatus={systemStatus}
            />
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
            <CardDescription>
              备份、恢复和维护系统数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">数据备份</h4>
                <p className="text-sm text-gray-600">
                  定期备份系统数据以防止数据丢失
                </p>
                <Button variant="outline" onClick={handleBackup}>
                  <Database className="h-4 w-4 mr-2" />
                  立即备份
                </Button>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">数据恢复</h4>
                <p className="text-sm text-gray-600">
                  从备份文件恢复系统数据
                </p>
                <Button variant="outline" onClick={handleRestore}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  恢复数据
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>
              查看系统的基本信息和运行状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">系统版本</span>
                  <span className="text-sm font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">数据库状态</span>
                  <Badge variant="default" className="text-xs">正常</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">缓存状态</span>
                  <Badge variant="default" className="text-xs">正常</Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">运行时间</span>
                  <span className="text-sm font-medium">24小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">内存使用</span>
                  <span className="text-sm font-medium">256MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">磁盘使用</span>
                  <span className="text-sm font-medium">1.2GB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}
