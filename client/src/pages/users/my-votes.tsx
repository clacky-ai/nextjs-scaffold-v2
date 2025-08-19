import { useEffect } from 'react';
import { useVotingStore } from '@/stores/users/votingStore';
import { useProjectStore } from '@/stores/users/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, Star, Calendar, ExternalLink, Github, FileText } from 'lucide-react';

export default function MyVotesPage() {
  const {
    userVotes,
    userStats,
    dimensions,
    isLoading: votingLoading,
    error: votingError,
    fetchUserVotes,
    fetchUserStats,
    fetchDimensions,
    clearError,
  } = useVotingStore();

  const {
    categories,
    fetchCategories,
  } = useProjectStore();

  useEffect(() => {
    fetchUserVotes();
    fetchUserStats();
    fetchDimensions();
    fetchCategories();
  }, [fetchUserVotes, fetchUserStats, fetchDimensions, fetchCategories]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const getDimensionName = (dimensionId: string) => {
    const dimension = dimensions.find(d => d.id === dimensionId);
    return dimension?.name || '未知维度';
  };

  const getScoreForDimension = (scores: any[], dimensionId: string) => {
    const score = scores.find(s => s.dimensionId === dimensionId);
    return score ? score.score : 0;
  };

  if (votingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载投票历史...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">我的投票</h1>
              <p className="text-gray-600 mt-1">查看您的投票历史和评价</p>
            </div>
            <Button onClick={fetchUserVotes} disabled={votingLoading}>
              {votingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              刷新数据
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {votingError && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription className="flex justify-between items-center">
              {votingError}
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
              <CardTitle>投票统计</CardTitle>
              <CardDescription>您的投票使用情况</CardDescription>
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

        {/* 投票历史 */}
        {userVotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无投票记录</p>
              <p className="text-gray-400 text-sm mt-2">
                您还没有为任何项目投票，快去投票页面为优秀项目投票吧！
              </p>
              <Button className="mt-4" asChild>
                <a href="/voting">开始投票</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {userVotes.map((voteWithScores) => {
              const { vote, scores } = voteWithScores;
              
              return (
                <Card key={vote.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          项目投票记录
                        </CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(vote.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        项目 ID: {vote.projectId.slice(-8)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* 评分详情 */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        评分详情
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dimensions.map((dimension) => {
                          const score = getScoreForDimension(scores, dimension.id);
                          return (
                            <div key={dimension.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm">{dimension.name}</div>
                                <div className="text-xs text-gray-500">
                                  权重: {dimension.weight}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {score}/{dimension.maxScore}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {((score / dimension.maxScore) * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 评价内容 */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        评价内容
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {vote.comment}
                        </p>
                      </div>
                    </div>

                    {/* 总分计算 */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">加权总分</span>
                        <div className="text-right">
                          {(() => {
                            let totalWeightedScore = 0;
                            let totalWeight = 0;
                            
                            dimensions.forEach(dimension => {
                              const score = getScoreForDimension(scores, dimension.id);
                              const weight = parseFloat(dimension.weight);
                              totalWeightedScore += score * weight;
                              totalWeight += weight;
                            });
                            
                            const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
                            
                            return (
                              <div className="text-xl font-bold text-blue-600">
                                {averageScore.toFixed(2)}/10
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
