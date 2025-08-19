import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  FileText,
  Vote,
  Trophy,
  Settings,
  BarChart3,
  Download
} from "lucide-react";
import { Link } from "wouter";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { projects, categories } = useProjects();
  const [activeTab, setActiveTab] = useState("overview");

  // 计算统计数据
  const totalProjects = projects.length;
  const totalCategories = categories.length;
  const totalUsers = 1; // 简化处理，实际应该从API获取

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center ml-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">管理后台</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user?.realName}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="projects">项目管理</TabsTrigger>
            <TabsTrigger value="statistics">统计分析</TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">总项目数</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">注册用户</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Vote className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">项目分类</p>
                      <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">活跃投票</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
                <CardDescription>常用的管理操作</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/submit">
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      添加项目
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button className="w-full" variant="outline">
                      <Trophy className="w-4 h-4 mr-2" />
                      查看排行榜
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 项目管理页面 */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>项目列表</CardTitle>
                <CardDescription>管理所有提交的项目</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">暂无项目</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const category = categories.find(c => c.id === project.categoryId);
                      return (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium">{project.title}</h3>
                                {category && (
                                  <Badge variant="outline" style={{ 
                                    backgroundColor: category.color + '20', 
                                    color: category.color 
                                  }}>
                                    {category.name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>提交时间：{new Date(project.submittedAt).toLocaleDateString()}</span>
                                <span className="mx-2">•</span>
                                <span>团队成员：{project.teamMembers.length}人</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Link href={`/project/${project.id}`}>
                                <Button size="sm" variant="outline">查看</Button>
                              </Link>
                              <Button size="sm" variant="outline">编辑</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计分析页面 */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  统计分析
                </CardTitle>
                <CardDescription>投票系统的详细统计数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">统计功能开发中...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    将包含投票趋势、用户活跃度、项目热度等分析
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
