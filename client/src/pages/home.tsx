import { useAuth } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Building, Phone, Mail, FolderOpen, Vote, BarChart3, Plus } from 'lucide-react';
import { Link } from 'wouter';

export default function HomePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">投票评选系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(user.realName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.realName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 用户信息卡片 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  个人信息
                </CardTitle>
                <CardDescription>您的账户详细信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {getInitials(user.realName)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold">{user.realName}</h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {user.isActive ? '活跃用户' : '已禁用'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.organization && (
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.organization}</span>
                    </div>
                  )}

                  {user.department && (
                    <div className="text-sm">
                      <span className="text-gray-500">部门：</span>
                      <span>{user.department}</span>
                    </div>
                  )}

                  {user.position && (
                    <div className="text-sm">
                      <span className="text-gray-500">职位：</span>
                      <span>{user.position}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主要功能区域 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    项目管理
                  </CardTitle>
                  <CardDescription>提交和管理您的项目</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/projects/new">提交新项目</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/my-projects">我的项目</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    浏览项目
                  </CardTitle>
                  <CardDescription>查看所有参赛项目</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/projects">查看项目列表</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Vote className="h-5 w-5 mr-2" />
                    参与投票
                  </CardTitle>
                  <CardDescription>为优秀项目投票</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/voting">开始投票</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/my-votes">我的投票</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    投票结果
                  </CardTitle>
                  <CardDescription>查看实时统计结果</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/results">查看结果</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 系统状态 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>系统状态</CardTitle>
                <CardDescription>当前投票活动信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">投票系统功能正在开发中...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    用户认证系统已完成，项目管理和投票功能即将上线
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}