import { useEffect, useState } from 'react';
import { useVotingStore } from '@/stores/votingStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Vote, Star, MessageSquare, ExternalLink, Github, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function VotingPage() {
  const {
    dimensions,
    userStats,
    isLoading: votingLoading,
    error: votingError,
    currentScores,
    currentComment,
    fetchDimensions,
    fetchUserStats,
    setCurrentScores,
    setCurrentComment,
    checkCanVote,
    submitVote,
    clearError,
    resetVoteForm,
  } = useVotingStore();

  const {
    projects,
    categories,
    isLoading: projectLoading,
    error: projectError,
    fetchProjects,
    fetchCategories,
  } = useProjectStore();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [canVoteResult, setCanVoteResult] = useState<any>(null);
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);

  useEffect(() => {
    fetchDimensions();
    fetchUserStats();
    fetchCategories();
    fetchProjects({ status: 'published' });
  }, [fetchDimensions, fetchUserStats, fetchCategories, fetchProjects]);

  const handleProjectSelect = async (project: any) => {
    setSelectedProject(project);
    try {
      const result = await checkCanVote(project.id);
      setCanVoteResult(result);
    } catch (error) {
      setCanVoteResult({ canVote: false, reason: '检查投票权限失败' });
    }
  };

  const handleScoreChange = (dimensionId: string, value: number[]) => {
    setCurrentScores({
      ...currentScores,
      [dimensionId]: value[0],
    });
  };

  const handleVoteSubmit = async () => {
    if (!selectedProject) return;

    // 验证所有维度都已评分
    const missingDimensions = dimensions.filter(d => !(d.id in currentScores));
    if (missingDimensions.length > 0) {
      alert('请为所有评分维度打分');
      return;
    }

    // 验证评价内容
    if (currentComment.trim().length < 10) {
      alert('评价内容至少需要10个字符');
      return;
    }

    try {
      await submitVote({
        projectId: selectedProject.id,
        scores: currentScores,
        comment: currentComment.trim(),
      });

      setIsVoteDialogOpen(false);
      setSelectedProject(null);
      setCanVoteResult(null);
      alert('投票提交成功！');
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const isFormValid = () => {
    return dimensions.every(d => d.id in currentScores) && currentComment.trim().length >= 10;
  };

  if (projectLoading || votingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载投票页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目投票</h1>
              <p className="text-gray-600 mt-1">为优秀项目投票，每人最多3票</p>
            </div>
            {userStats && (
              <div className="text-right">
                <div className="text-sm text-gray-600">投票进度</div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(userStats.totalVotes / userStats.maxVotes) * 100} 
                    className="w-24"
                  />
                  <span className="text-sm font-medium">
                    {userStats.totalVotes}/{userStats.maxVotes}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {(votingError || projectError) && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription className="flex justify-between items-center">
              {votingError || projectError}
              <Button variant="outline" size="sm" onClick={clearError}>
                关闭
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 投票统计 */}
        {userStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Vote className="h-5 w-5 mr-2" />
                投票统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalVotes}</div>
                  <div className="text-sm text-gray-600">已投票数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.remainingVotes}</div>
                  <div className="text-sm text-gray-600">剩余票数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{userStats.maxVotes}</div>
                  <div className="text-sm text-gray-600">总票数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无可投票的项目</p>
              <p className="text-gray-400 text-sm mt-2">
                还没有项目发布，请稍后再来查看
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {project.categoryId && (
                    <div className="flex items-center mt-2">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(project.categoryId) }}
                      />
                      <span className="text-sm text-gray-600">
                        {getCategoryName(project.categoryId)}
                      </span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {/* 标签 */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
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
                  
                  {/* 链接 */}
                  <div className="flex space-x-2 mb-4">
                    {project.demoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          演示
                        </a>
                      </Button>
                    )}
                    {project.repositoryUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1" />
                          代码
                        </a>
                      </Button>
                    )}
                    {project.presentationUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.presentationUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          文档
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    
                    <Dialog open={isVoteDialogOpen && selectedProject?.id === project.id} onOpenChange={setIsVoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => handleProjectSelect(project)}
                          disabled={userStats?.remainingVotes === 0}
                        >
                          <Vote className="h-3 w-3 mr-1" />
                          投票
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>为项目投票</DialogTitle>
                          <DialogDescription>
                            {project.title}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {canVoteResult && !canVoteResult.canVote ? (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              {canVoteResult.reason}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-6">
                            {/* 评分维度 */}
                            <div className="space-y-4">
                              <h3 className="font-medium">评分维度</h3>
                              {dimensions.map((dimension) => (
                                <div key={dimension.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">
                                      {dimension.name}
                                      <span className="text-xs text-gray-500 ml-1">
                                        (权重: {dimension.weight})
                                      </span>
                                    </label>
                                    <span className="text-sm font-medium">
                                      {currentScores[dimension.id] || 0}/{dimension.maxScore}
                                    </span>
                                  </div>
                                  {dimension.description && (
                                    <p className="text-xs text-gray-600">{dimension.description}</p>
                                  )}
                                  <Slider
                                    value={[currentScores[dimension.id] || 0]}
                                    onValueChange={(value) => handleScoreChange(dimension.id, value)}
                                    max={dimension.maxScore}
                                    min={0}
                                    step={1}
                                    className="w-full"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* 评价内容 */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                评价内容 <span className="text-red-500">*</span>
                              </label>
                              <Textarea
                                placeholder="请详细说明您的评价理由（至少10个字符）..."
                                value={currentComment}
                                onChange={(e) => setCurrentComment(e.target.value)}
                                rows={4}
                              />
                              <p className="text-xs text-gray-500">
                                {currentComment.length}/10 (最少)
                              </p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsVoteDialogOpen(false);
                                  resetVoteForm();
                                }}
                              >
                                取消
                              </Button>
                              <Button 
                                onClick={handleVoteSubmit}
                                disabled={!isFormValid() || votingLoading}
                              >
                                {votingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                提交投票
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
