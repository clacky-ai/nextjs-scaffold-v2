import { useState, useEffect } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trophy,
  Medal,
  Award,
  Users,
  Star,
  Loader2,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

interface ProjectWithVotes {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  submitterId: string;
  tags: string[];
  teamMembers: { id: string; name: string; role?: string }[];
  submittedAt: string;
  totalVotes: number;
  averageScore: number;
}

export default function LeaderboardPage() {
  const { projects, categories, isProjectsLoading } = useProjects();
  const [projectsWithVotes, setProjectsWithVotes] = useState<ProjectWithVotes[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);

  // 获取所有项目的投票数据
  useEffect(() => {
    const fetchVotesData = async () => {
      if (projects.length === 0) return;
      
      setIsLoadingVotes(true);
      try {
        const projectsWithVotesData = await Promise.all(
          projects.map(async (project) => {
            try {
              const response = await fetch(`/api/projects/${project.id}/votes`);
              const voteData = await response.json();
              
              return {
                ...project,
                totalVotes: voteData.totalVotes || 0,
                averageScore: voteData.averageScores?.total || 0,
              };
            } catch (error) {
              console.error(`Error fetching votes for project ${project.id}:`, error);
              return {
                ...project,
                totalVotes: 0,
                averageScore: 0,
              };
            }
          })
        );

        // 按平均分排序，然后按投票数排序
        const sortedProjects = projectsWithVotesData.sort((a, b) => {
          if (b.averageScore !== a.averageScore) {
            return b.averageScore - a.averageScore;
          }
          return b.totalVotes - a.totalVotes;
        });

        setProjectsWithVotes(sortedProjects);
      } catch (error) {
        console.error("Error fetching votes data:", error);
      } finally {
        setIsLoadingVotes(false);
      }
    };

    fetchVotesData();
  }, [projects]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (isProjectsLoading || isLoadingVotes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载排行榜中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">项目排行榜</h1>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">项目排行榜</h2>
          </div>
          <p className="text-gray-600">根据平均评分和投票数量排序</p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{projectsWithVotes.length}</div>
              <div className="text-sm text-gray-600">参赛项目</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {projectsWithVotes.reduce((sum, p) => sum + p.totalVotes, 0)}
              </div>
              <div className="text-sm text-gray-600">总投票数</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {projectsWithVotes.length > 0 
                  ? (projectsWithVotes.reduce((sum, p) => sum + p.averageScore, 0) / projectsWithVotes.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-600">平均评分</div>
            </CardContent>
          </Card>
        </div>

        {/* 排行榜 */}
        {projectsWithVotes.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无排名数据</h3>
            <p className="text-gray-600">还没有项目获得投票</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectsWithVotes.map((project, index) => {
              const rank = index + 1;
              const category = categories.find(c => c.id === project.categoryId);
              
              return (
                <Card key={project.id} className={`hover:shadow-lg transition-shadow ${rank <= 3 ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* 排名图标 */}
                      <div className="flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>
                      
                      {/* 项目信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {project.title}
                              </h3>
                              <Badge className={getRankBadgeColor(rank)}>
                                第 {rank} 名
                              </Badge>
                              {category && (
                                <Badge variant="outline" style={{ 
                                  backgroundColor: category.color + '20', 
                                  color: category.color,
                                  borderColor: category.color + '40'
                                }}>
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            
                            {/* 标签 */}
                            {project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {project.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {project.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* 团队成员 */}
                            {project.teamMembers.length > 0 && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-1" />
                                <span>
                                  {project.teamMembers.slice(0, 2).map(m => m.name).join("、")}
                                  {project.teamMembers.length > 2 && ` 等${project.teamMembers.length}人`}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* 评分信息 */}
                          <div className="flex-shrink-0 text-right ml-4">
                            <div className="flex items-center mb-1">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-lg font-bold text-gray-900">
                                {project.averageScore > 0 ? project.averageScore.toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.totalVotes} 票
                            </div>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex space-x-2 mt-4">
                          <Link href={`/project/${project.id}`}>
                            <Button variant="outline" size="sm">
                              查看详情
                            </Button>
                          </Link>
                          <Link href={`/vote/${project.id}`}>
                            <Button size="sm">
                              投票
                            </Button>
                          </Link>
                        </div>
                      </div>
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
