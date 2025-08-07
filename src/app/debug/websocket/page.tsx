'use client'

import { useSocket } from '@/hooks/use-socket'
import { useState, useEffect } from 'react'

export default function WebSocketDebugPage() {
  const { socket, isConnected, authenticate, sendMessage } = useSocket()
  const [logs, setLogs] = useState<string[]>([])
  const [lastAuth, setLastAuth] = useState<string>('')

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('页面加载完成')
    
    // 监听认证成功事件
    if (socket) {
      const handleAuthSuccess = (data: any) => {
        addLog(`🎉 认证成功: ${data.userName} (${data.isAdmin ? '管理员' : '用户'})`)
      }
      
      socket.on('auth-success', handleAuthSuccess)
      
      return () => {
        socket.off('auth-success', handleAuthSuccess)
      }
    }
  }, [socket])

  useEffect(() => {
    addLog(`连接状态变更: ${isConnected ? '已连接' : '未连接'}`)
  }, [isConnected])

  const handleTestAuth = () => {
    const authData = {
      userId: 'test-user-id',
      userName: 'Test User',
      userEmail: 'test@example.com',
      isAdmin: false
    }
    authenticate(authData)
    setLastAuth('用户认证: Test User')
    addLog('✅ 已发送用户认证数据到服务器')
    addLog('请查看服务器控制台确认认证成功')
  }

  const handleTestAdminAuth = () => {
    const authData = {
      userId: 'test-admin-id',
      userName: 'Test Admin',
      userEmail: 'admin@example.com',
      isAdmin: true
    }
    authenticate(authData)
    setLastAuth('管理员认证: Test Admin')
    addLog('✅ 已发送管理员认证数据到服务器')
    addLog('请查看服务器控制台确认认证成功')
  }

  const handleGetOnlineUsers = () => {
    sendMessage('get-online-users', {})
    addLog('📡 请求获取在线用户列表')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WebSocket 连接调试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 连接状态 */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">连接状态</h2>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? '已连接' : '未连接'}
            </div>
            <div className="text-sm text-gray-600">
              Socket ID: {socket?.id || '无'}
            </div>
            <div className="text-sm text-gray-600">
              当前URL: {typeof window !== 'undefined' ? window.location.origin : ''}
            </div>
            {lastAuth && (
              <div className="text-sm text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                最后认证: {lastAuth}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <button 
              onClick={handleTestAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block w-full"
              disabled={!isConnected}
            >
              测试用户认证
            </button>
            <button 
              onClick={handleTestAdminAuth}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 block w-full"
              disabled={!isConnected}
            >
              测试管理员认证
            </button>
            <button 
              onClick={handleGetOnlineUsers}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 block w-full"
              disabled={!isConnected}
            >
              获取在线用户 (需要管理员权限)
            </button>
          </div>
        </div>

        {/* 日志 */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">连接日志</h2>
          <div className="bg-gray-100 p-3 rounded text-sm max-h-64 overflow-y-auto font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500">暂无日志</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setLogs([])}
            className="mt-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            清空日志
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-6 border rounded-lg p-4 bg-yellow-50">
        <h3 className="font-semibold text-yellow-800">调试说明</h3>
        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
          <li>• 打开浏览器开发者工具的控制台查看详细的WebSocket连接日志</li>
          <li>• 如果连接失败，检查Network标签页中的Socket.IO请求</li>
          <li>• 确保开发服务器正在运行且Socket.IO端点可访问</li>
        </ul>
      </div>
    </div>
  )
}