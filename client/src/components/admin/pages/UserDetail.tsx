import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Calendar, MapPin, Phone, User as UserIcon, Shield, Clock, Activity } from 'lucide-react';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';
import { useUserStore } from '@/stores/admin/userStore';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const routes = useAdminRoutes();
  const { users, fetchUsers, loading } = useUserStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [fetchUsers, users.length]);

  useEffect(() => {
    const foundUser = users.find(u => u.id === userId);
    setUser(foundUser);
  }, [userId, users]);

  const handleBack = () => {
    routes.navigate('users');
  };

  if (loading.fetchUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">加载用户信息中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回用户列表
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">用户不存在</p>
              <p className="text-sm text-muted-foreground">请检查用户 ID 是否正确</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回用户列表
        </Button>
      </div>

      {/* 用户基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {user.isBlocked ? '已屏蔽' : '正常'}
                </Badge>
                <Badge variant="outline">用户</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 个人信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">邮箱</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">手机号</p>
                <p className="text-sm text-muted-foreground">{user.phone || '未设置'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">地址</p>
                <p className="text-sm text-muted-foreground">{user.address || '未设置'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">注册时间</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账户状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              账户状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">账户状态</p>
                <p className="text-sm text-muted-foreground">
                  {user.isBlocked ? '已屏蔽' : '正常'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">最后登录</p>
                <p className="text-sm text-muted-foreground">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN')
                    : '从未登录'
                  }
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">用户ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与项目</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              参与的投票项目数量
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">投票次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              总投票次数
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">低</div>
            <p className="text-xs text-muted-foreground">
              基于最近活动评估
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>管理操作</CardTitle>
          <CardDescription>对用户账户进行管理操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              编辑用户信息
            </Button>
            <Button variant="outline">
              重置密码
            </Button>
            <Button 
              variant={user.isBlocked ? "default" : "destructive"}
              className={user.isBlocked ? "" : "bg-red-600 hover:bg-red-700"}
            >
              {user.isBlocked ? '解除屏蔽' : '屏蔽用户'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}