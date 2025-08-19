import { useProject } from "@/hooks/useProjects";
import { useProjectVotes } from "@/hooks/useVotes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Users,
  ExternalLink,
  Github,
  FileText,
  Loader2,
  Star,
  BarChart3
} from "lucide-react";
import { Link, useParams } from "wouter";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useProject(id!);
  const { data: voteResults, isLoading: isVotesLoading } = useProjectVotes(id!);

  if (isProjectLoading || isVotesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">项目不存在</h3>
          <p className="text-gray-600 mb-4">您访问的项目不存在或已被删除</p>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  const scoreLabels = {
    innovation: '创新性',
    technical: '技术实现',
    practicality: '实用性',
    presentation: '展示效果',
    teamwork: '团队协作',
  };

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
            <h1 className="ml-4 text-xl font-semibold text-gray-900">项目详情</h1>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 项目信息 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <CardDescription>
                  提交时间：{new Date(project.submittedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">项目描述</h3>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>
                
                {/* 标签 */}
                {project.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">项目标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 团队成员 */}
                {project.teamMembers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">团队成员</h3>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {project.teamMembers.map(m => `${m.name}${m.role ? ` (${m.role})` : ''}`).join("、")}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 链接 */}
                <div>
                  <h3 className="text-lg font-medium mb-2">相关链接</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.demoUrl && (
                      <Button variant="outline" asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          在线演示
                        </a>
                      </Button>
                    )}
                    {project.repositoryUrl && (
                      <Button variant="outline" asChild>
                        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          源代码
                        </a>
                      </Button>
                    )}
                    {project.presentationUrl && (
                      <Button variant="outline" asChild>
                        <a href={project.presentationUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          演示文稿
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 投票评价 */}
            {voteResults && voteResults.votes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    投票评价
                  </CardTitle>
                  <CardDescription>
                    共收到 {voteResults.totalVotes} 票投票
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {voteResults.votes.map((vote, index) => (
                    <div key={vote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">投票 #{index + 1}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(vote.votedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                        {Object.entries(scoreLabels).map(([key, label]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-gray-500">{label}</div>
                            <div className="text-sm font-medium">
                              {vote.scores[key as keyof typeof vote.scores]}分
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {vote.comment}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 投票统计 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  投票统计
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {voteResults?.totalVotes || 0}
                  </div>
                  <div className="text-sm text-gray-600">总投票数</div>
                </div>
                
                {voteResults && voteResults.totalVotes > 0 && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {voteResults.averageScores.total.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">平均总分</div>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(scoreLabels).map(([key, label]) => {
                        const score = voteResults.averageScores[key as keyof typeof voteResults.averageScores];
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{label}</span>
                              <span className="font-medium">{score.toFixed(1)}/10</span>
                            </div>
                            <Progress value={score * 10} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {(!voteResults || voteResults.totalVotes === 0) && (
                  <div className="text-center text-gray-500 py-4">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">暂无投票</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Link href={`/vote/${project.id}`}>
                <Button className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  为此项目投票
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
