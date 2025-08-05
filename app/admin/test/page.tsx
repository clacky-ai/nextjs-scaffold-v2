'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function AdminTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: '用户管理 API', status: 'pending', message: '测试中...' },
    { name: '项目管理 API', status: 'pending', message: '测试中...' },
    { name: '投票管理 API', status: 'pending', message: '测试中...' },
    { name: '系统设置 API', status: 'pending', message: '测试中...' },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const newTests = [...tests]

    // 测试用户管理 API
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        newTests[0] = {
          name: '用户管理 API',
          status: 'success',
          message: `成功获取 ${data.length} 个用户`,
          data: data.slice(0, 3) // 只显示前3个用户
        }
      } else {
        newTests[0] = {
          name: '用户管理 API',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      newTests[0] = {
        name: '用户管理 API',
        status: 'error',
        message: `网络错误: ${error}`
      }
    }
    setTests([...newTests])

    // 测试项目管理 API
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        newTests[1] = {
          name: '项目管理 API',
          status: 'success',
          message: `成功获取 ${data.length} 个项目`,
          data: data.slice(0, 3) // 只显示前3个项目
        }
      } else {
        newTests[1] = {
          name: '项目管理 API',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      newTests[1] = {
        name: '项目管理 API',
        status: 'error',
        message: `网络错误: ${error}`
      }
    }
    setTests([...newTests])

    // 测试投票管理 API
    try {
      const response = await fetch('/api/admin/votes')
      if (response.ok) {
        const data = await response.json()
        newTests[2] = {
          name: '投票管理 API',
          status: 'success',
          message: `成功获取 ${data.length} 个投票记录`,
          data: data.slice(0, 3) // 只显示前3个投票
        }
      } else {
        newTests[2] = {
          name: '投票管理 API',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      newTests[2] = {
        name: '投票管理 API',
        status: 'error',
        message: `网络错误: ${error}`
      }
    }
    setTests([...newTests])

    // 测试系统设置 API
    try {
      const response = await fetch('/api/admin/system')
      if (response.ok) {
        const data = await response.json()
        newTests[3] = {
          name: '系统设置 API',
          status: 'success',
          message: `系统状态: ${data.isVotingEnabled ? '投票开启' : '投票暂停'}`,
          data: data
        }
      } else {
        newTests[3] = {
          name: '系统设置 API',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      newTests[3] = {
        name: '系统设置 API',
        status: 'error',
        message: `网络错误: ${error}`
      }
    }
    setTests([...newTests])
    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">成功</Badge>
      case 'error':
        return <Badge variant="destructive">失败</Badge>
      case 'pending':
        return <Badge variant="secondary">测试中</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length
  const pendingCount = tests.filter(t => t.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">管理员功能测试</h1>
          <p className="text-gray-600 mt-2">测试所有管理员 API 端点的可用性</p>
        </div>

        {/* 测试概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">成功</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">失败</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">总计</p>
                  <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 重新运行测试按钮 */}
        <div className="flex justify-center">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isRunning ? '测试中...' : '重新运行测试'}</span>
          </Button>
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(test.status)}
                    <span>{test.name}</span>
                  </CardTitle>
                  {getStatusBadge(test.status)}
                </div>
                <CardDescription>{test.message}</CardDescription>
              </CardHeader>
              {test.data && (
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">返回数据示例:</p>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* 导航链接 */}
        <Card>
          <CardHeader>
            <CardTitle>快速导航</CardTitle>
            <CardDescription>访问管理员功能页面</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <a href="/admin/dashboard">管理员仪表板</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/demo">布局演示</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/sign-in">管理员登录</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">返回首页</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
