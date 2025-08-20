import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MoreHorizontal, UserPlus, Filter, Download, Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/admin/userStore';

export function UsersManagement() {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    toggleUserStatus,
    stats,
    filteredUsers,
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (userId: string, isBlocked: boolean) => {
    const success = await toggleUserStatus(userId, isBlocked);
    if (success) {
      // 可以添加成功提示
      console.log('用户状态更新成功');
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats().newThisMonth} 较上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().active}</div>
            <p className="text-xs text-muted-foreground">
              活跃率 {stats().total > 0 ? Math.round((stats().active / stats().total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">被屏蔽用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().blocked}</div>
            <p className="text-xs text-muted-foreground">
              需要关注的用户
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              新注册用户
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>
      </div>

      {/* 用户表格 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            管理系统中的所有用户账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>项目数</TableHead>
                <TableHead>投票数</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.fetchUsers ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">加载用户数据中...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">暂无用户数据</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">用户</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {user.isBlocked ? '已屏蔽' : '正常'}
                      </Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑用户</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user.id, user.isBlocked)}
                            className={user.isBlocked ? 'text-green-600' : 'text-red-600'}
                          >
                            {user.isBlocked ? '解除屏蔽' : '屏蔽用户'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
