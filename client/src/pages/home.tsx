import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useVotes } from "@/hooks/useVotes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Plus,
  Vote,
  Users,
  FileText,
  Loader2,
  Trophy,
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logout } = useAuth();
  const { projects, categories, isProjectsLoading, initCategories } = useProjects();
  const { remainingVotes } = useVotes();

  // 如果没有分类，显示初始化按钮
  const showInitButton = categories.length === 0 && !isProjectsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">投票系统</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.realName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">{user?.realName}</span>
              </div>

              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  管理
                </Button>
              </Link>

              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">项目投票</h2>
            <p className="text-gray-600 mt-1">为您喜欢的项目投票，每人最多可投3票</p>
          </div>

          <div className="flex space-x-2">
            {showInitButton && (
              <Button variant="outline" onClick={() => initCategories()}>
                初始化分类
              </Button>
            )}
            <Link href="/leaderboard">
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                排行榜
              </Button>
            </Link>
            <Link href="/submit">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                提交项目
              </Button>
            </Link>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总项目数</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Vote className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">我的剩余票数</p>
                  <p className="text-2xl font-bold text-gray-900">{remainingVotes ?? 3}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">参与人数</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 项目列表 */}
        {isProjectsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">加载项目中...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
            <p className="text-gray-600 mb-4">还没有项目提交，成为第一个提交项目的人吧！</p>
            <Link href="/submit">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                提交项目
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              // 查找项目分类
              const category = categories.find(c => c.id === project.categoryId);

              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="mt-1">
                          提交时间：{new Date(project.submittedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {category && (
                        <Badge variant="secondary" style={{ backgroundColor: category.color + '20', color: category.color }}>
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                    {/* 标签 */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 团队成员 */}
                    {project.teamMembers.length > 0 && (
                      <div className="flex items-center mb-4">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          团队成员：{project.teamMembers.map(m => m.name).join("、")}
                        </span>
                      </div>
                    )}

                    {/* 链接 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            演示
                          </a>
                        </Button>
                      )}
                      {project.repositoryUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                            代码
                          </a>
                        </Button>
                      )}
                      {project.presentationUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.presentationUrl} target="_blank" rel="noopener noreferrer">
                            演示文稿
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <Link href={`/project/${project.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          查看详情
                        </Button>
                      </Link>
                      <Link href={`/vote/${project.id}`}>
                        <Button size="sm" className="flex-1">
                          <Vote className="w-4 h-4 mr-2" />
                          投票
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
