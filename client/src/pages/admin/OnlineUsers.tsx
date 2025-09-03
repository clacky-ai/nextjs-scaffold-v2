import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users,
  UserCheck,
  Clock,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Eye,
  UserX,
  Activity
} from 'lucide-react';
import { useOnlineUsersStore } from '@/stores/admin/onlineUsersStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { communicationManager } from '@/lib/websocket/CommunicationManager';


export function OnlineUsers() {
  const store = useOnlineUsersStore();
  const {
    filters,
    isLoading,
    error,
    lastUpdated,
    totalUsers,
    onlineCount,
    stats,
  } = store;

  // 使用 store 中的过滤方法
  const filteredUsers = store.getFilteredUsers();

  // 页面初始化时获取当前在线用户
  useEffect(() => {
    console.log('OnlineUsers 页面初始化，请求当前在线用户列表');

    // 延迟一下确保 WebSocket 连接已建立
    const timer = setTimeout(() => {
      // 发送请求获取当前在线用户列表
      communicationManager.send('admin:users:request_online', {
        timestamp: Date.now()
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    store.setLoading(true);
    // WebSocket 会自动接收实时数据，这里只是重置加载状态
    setTimeout(() => store.setLoading(false), 500);
  }, [store]);

  // 查看用户详情
  const handleViewUser = useCallback((userId: string) => {
    store.setSelectedUserId(userId);
    // 可以打开用户详情模态框或导航到用户详情页
  }, [store]);

  // 踢出用户
  const handleKickUser = useCallback((userId: string, username: string) => {
    if (confirm(`确定要踢出用户 "${username}" 吗？`)) {
      // 发送踢出用户的 WebSocket 消息
      console.log(`踢出用户: ${userId}, 用户名: ${username}`);
      // communicationManager.send('admin:users:kick', { userId, reason: '管理员操作' });
    }
  }, []);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: zhCN
    });
  };

  // 获取用户状态
  const getUserStatus = (user: any) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return user.lastActivity > fiveMinutesAgo ? 'active' : 'idle';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">在线用户</h1>
          <p className="text-muted-foreground">
            实时监控在线用户状态和活动情况
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>



      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前在线</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
            <p className="text-xs text-muted-foreground">
              总用户数: {totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日峰值</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peakOnlineToday}</div>
            <p className="text-xs text-muted-foreground">
              比昨日 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均会话时长</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageSessionTime / 60)}分钟</div>
            <p className="text-xs text-muted-foreground">
              比昨日 +5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日新用户</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersToday}</div>
            <p className="text-xs text-muted-foreground">
              比昨日 +8%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 过滤和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            最后更新: {lastUpdated ? formatTime(lastUpdated) : '从未更新'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={filters.searchQuery}
                  onChange={(e) => store.setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* 排序选择 */}
            <Select value={filters.sortBy} onValueChange={store.setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joinTime">加入时间</SelectItem>
                <SelectItem value="lastActivity">最后活动</SelectItem>
                <SelectItem value="username">用户名</SelectItem>
              </SelectContent>
            </Select>

            {/* 排序方向 */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => store.setSortOrder(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* 只显示活跃用户 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-active"
                checked={filters.showOnlyActive}
                onCheckedChange={store.toggleShowOnlyActive}
              />
              <Label htmlFor="show-active">仅活跃用户</Label>
            </div>
          </div>

          {/* 用户表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>加入时间</TableHead>
                  <TableHead>最后活动</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {isLoading ? '加载中...' : '暂无在线用户'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status === 'active' ? '活跃' : '空闲'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatTime(user.joinTime)}</TableCell>
                        <TableCell>{formatTime(user.lastActivity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUser(user.userId)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleKickUser(user.userId, user.username)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
