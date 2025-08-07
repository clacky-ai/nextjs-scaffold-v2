'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, MessageCircle, Send, RefreshCw, Clock, Wifi } from 'lucide-react'
import { ActionBar, ActionBarButton } from './action-bar'
import { useAdminWebSocketStore, useOnlineUserStore } from '@/stores/admin'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { OnlineUser } from '@/stores/admin/types'

export function OnlineUsersManagement() {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null)
  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error'
  })
  const [currentTime, setCurrentTime] = useState(Date.now())

  // WebSocket store for real-time messaging
  const { 
    onlineUsers, 
    onlineUserCount,
    socket,
    sendMessageToUser, 
    sendBroadcastMessage,
    loading 
  } = useAdminWebSocketStore()
  
  // Legacy online user store for fallback API calls
  const { fetchOnlineUsers } = useOnlineUserStore()

  // Fetch online users data (fallback or initial load)
  const handleRefresh = () => {
    if (socket) {
      socket.emit('get-online-users', {})
    } else {
      // Fallback to API call
      fetchOnlineUsers()
    }
  }

  // Initialize data on component mount
  useEffect(() => {
    handleRefresh()
  }, [socket])

  // 更新当前时间以刷新在线时长显示
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000) // 每秒更新一次

    return () => clearInterval(timer)
  }, [])

  // 发送消息给特定用户
  const handleSendToUser = (user: OnlineUser) => {
    setSelectedUser(user)
    setMessageForm({
      title: '',
      message: '',
      type: 'info'
    })
    setIsMessageDialogOpen(true)
  }

  // 发送消息给所有用户
  const handleSendToAllUsers = () => {
    setSelectedUser(null)
    setMessageForm({
      title: '',
      message: '',
      type: 'info'
    })
    setIsMessageDialogOpen(true)
  }

  // 提交消息
  const handleSendMessage = async () => {
    if (!messageForm.title.trim() || !messageForm.message.trim()) {
      return
    }

    const messageData = {
      title: messageForm.title,
      message: messageForm.message,
      type: messageForm.type
    }

    let success = false

    if (selectedUser) {
      // 发送给特定用户
      success = await sendMessageToUser({
        targetUserId: selectedUser.userId,
        ...messageData
      })
    } else {
      // 广播给所有用户
      success = await sendBroadcastMessage(messageData)
    }

    if (success) {
      // 关闭对话框
      setIsMessageDialogOpen(false)
      setMessageForm({ title: '', message: '', type: 'info' })
      setSelectedUser(null)
    }
  }

  // 格式化时间
  const formatTime = (timestamp: string | number) => {
    if (!timestamp) {
      return '未知'
    }
    
    const date = new Date(timestamp)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效时间'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    if (diffMs < 60000) { // 小于1分钟
      return '刚刚'
    } else if (diffMs < 3600000) { // 小于1小时
      return formatDistanceToNow(date, { locale: zhCN, addSuffix: true })
    } else {
      return format(date, 'HH:mm:ss', { locale: zhCN })
    }
  }

  // 获取用户状态
  const getUserStatus = (lastActivity: string | number) => {
    if (!lastActivity) {
      return { status: 'away', color: 'bg-gray-500', text: '未知' }
    }
    
    const now = new Date().getTime()
    const lastActiveTime = new Date(lastActivity).getTime()
    
    // 检查日期是否有效
    if (isNaN(lastActiveTime)) {
      return { status: 'away', color: 'bg-gray-500', text: '未知' }
    }
    
    const diffMs = now - lastActiveTime
    
    if (diffMs < 30000) { // 30秒内活跃
      return { status: 'active', color: 'bg-green-500', text: '在线' }
    } else if (diffMs < 300000) { // 5分钟内活跃
      return { status: 'idle', color: 'bg-yellow-500', text: '空闲' }
    } else {
      return { status: 'away', color: 'bg-gray-500', text: '离开' }
    }
  }

  // 计算在线时长
  const getOnlineDuration = (connectedAt: string | number) => {
    if (!connectedAt) {
      return '未知'
    }
    
    const connectedTime = new Date(connectedAt).getTime()
    
    // 检查日期是否有效
    if (isNaN(connectedTime)) {
      return '未知'
    }
    
    const durationMs = currentTime - connectedTime
    
    // 转换为小时、分钟、秒
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}时${minutes}分`
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }

  return (
    <div className="space-y-6">
      {/* ActionBar - 标题和操作按钮 */}
      <ActionBar
        title="在线用户"
        description="管理当前在线的用户，查看用户状态并发送实时消息"
        actions={
          <>
            <ActionBarButton onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </ActionBarButton>
            <ActionBarButton onClick={handleSendToAllUsers}>
              <MessageCircle className="h-4 w-4 mr-2" />
              广播消息
            </ActionBarButton>
          </>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineUserCount}</div>
            <p className="text-xs text-muted-foreground">
              实时统计
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineUsers.filter(user => 
                new Date().getTime() - new Date(user.lastActivity).getTime() < 30000
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              30秒内活跃
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均在线时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineUsers.length > 0 ? 
                Math.round(
                  onlineUsers.reduce((acc, user) => 
                    acc + (new Date().getTime() - new Date(user.connectedAt).getTime()), 0
                  ) / onlineUsers.length / 60000
                ) : 0
              }分钟
            </div>
            <p className="text-xs text-muted-foreground">
              用户平均在线时长
            </p>
          </CardContent>
        </Card>
      </div>


      {/* 在线用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>在线用户列表</CardTitle>
          <CardDescription>
            当前在线的用户，点击用户可以发送个人消息
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onlineUserCount === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">暂无在线用户</h3>
              <p className="text-muted-foreground">等待用户连接...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>连接时间</TableHead>
                  <TableHead>在线时长</TableHead>
                  <TableHead>最后活跃</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onlineUsers.map((user) => {
                  const status = getUserStatus(user.lastActivity)
                  return (
                    <TableRow key={user.socketId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color}`} />
                          <Badge variant={status.status === 'active' ? 'default' : 'secondary'}>
                            {status.text}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.connectedAt && !isNaN(new Date(user.connectedAt).getTime()) 
                            ? format(new Date(user.connectedAt), 'HH:mm:ss')
                            : '未知'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-blue-600">
                          {getOnlineDuration(user.connectedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatTime(user.lastActivity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleSendToUser(user)}
                          size="sm"
                          variant="outline"
                          disabled={Boolean(loading[`sendMessage_${user.userId}`])}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          发消息
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 发送消息对话框 */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `发送消息给 ${selectedUser.userName}` : '广播消息给所有在线用户'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? `向用户 ${selectedUser.userName} (${selectedUser.userEmail}) 发送个人消息`
                : `向所有 ${onlineUserCount} 个在线用户发送广播消息`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message-type">消息类型</Label>
              <Select
                value={messageForm.type}
                onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                  setMessageForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">信息</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message-title">消息标题</Label>
              <Input
                id="message-title"
                placeholder="输入消息标题..."
                value={messageForm.title}
                onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message-content">消息内容</Label>
              <Textarea
                id="message-content"
                placeholder="输入消息内容..."
                value={messageForm.message}
                onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMessageDialogOpen(false)}
              disabled={Boolean(loading.broadcast) || (selectedUser ? Boolean(loading[`sendMessage_${selectedUser.userId}`]) : false)}
            >
              取消
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!messageForm.title.trim() || !messageForm.message.trim() || Boolean(loading.broadcast) || (selectedUser ? Boolean(loading[`sendMessage_${selectedUser.userId}`]) : false)}
            >
              {(Boolean(loading.broadcast) || (selectedUser ? Boolean(loading[`sendMessage_${selectedUser.userId}`]) : false)) ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  发送消息
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}