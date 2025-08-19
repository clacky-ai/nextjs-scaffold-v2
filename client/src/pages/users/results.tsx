import { useEffect, useState } from 'react';
import { useVotingStore } from '@/stores/users/votingStore';
import { useProjectStore } from '@/stores/users/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, BarChart3, Star, TrendingUp, Users, Vote, Medal, Crown, Award } from 'lucide-react';

export default function ResultsPage() {
  const {
    votingResults,
    dimensions,
    isLoading: votingLoading,
    error: votingError,
    fetchVotingResults,
    fetchDimensions,
    clearError,
  } = useVotingStore();

  const {
    categories,
    fetchCategories,
  } = useProjectStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchVotingResults();
    fetchDimensions();
    fetchCategories();
  }, [fetchVotingResults, fetchDimensions, fetchCategories]);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredProjects = votingResults?.projects.filter(item => 
    !selectedCategory || item.project.categoryId === selectedCategory
  ) || [];

  if (votingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载投票结果...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">投票结果</h1>
              <p className="text-gray-600 mt-1">实时投票统计和排名</p>
            </div>
            <Button onClick={fetchVotingResults} disabled={votingLoading}>
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

        {/* 总体统计 */}
        {votingResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总投票数</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{votingResults.totalVotes}</div>
                <p className="text-xs text-muted-foreground">
                  来自所有参与者的投票
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">参赛项目</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{votingResults.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  已发布的项目数量
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均投票数</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {votingResults.totalProjects > 0 
                    ? (votingResults.totalVotes / votingResults.totalProjects).toFixed(1)
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  每个项目的平均票数
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 分类筛选 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>分类筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                全部分类
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 结果展示 */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无投票结果</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedCategory ? '该分类下暂无项目' : '还没有项目参与投票'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="ranking" className="space-y-6">
            <TabsList>
              <TabsTrigger value="ranking">排行榜</TabsTrigger>
              <TabsTrigger value="detailed">详细分析</TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="space-y-4">
              {filteredProjects.map((item, index) => (
                <Card key={item.project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                          {getRankIcon(item.rank)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{item.project.title}</CardTitle>
                            <Badge variant={getRankBadgeVariant(item.rank)}>
                              第 {item.rank} 名
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">
                            {item.project.description}
                          </CardDescription>
                          {item.project.categoryId && (
                            <div className="flex items-center mt-2">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getCategoryColor(item.project.categoryId) }}
                              />
                              <span className="text-sm text-gray-600">
                                {getCategoryName(item.project.categoryId)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {item.averageScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">平均分</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.totalVotes} 票
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">各维度评分</h4>
                      {Object.entries(item.averageScores).map(([dimensionId, score]) => (
                        <div key={dimensionId} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {getDimensionName(dimensionId)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Progress value={(score / 10) * 100} className="w-20" />
                            <span className="text-sm font-medium w-8">
                              {score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 分类统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle>分类统计</CardTitle>
                    <CardDescription>各分类项目数量和平均分</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const categoryProjects = votingResults?.projects.filter(
                          item => item.project.categoryId === category.id
                        ) || [];
                        const avgScore = categoryProjects.length > 0
                          ? categoryProjects.reduce((sum, item) => sum + item.averageScore, 0) / categoryProjects.length
                          : 0;

                        return (
                          <div key={category.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {categoryProjects.length} 项目
                              </div>
                              <div className="text-xs text-gray-500">
                                平均 {avgScore.toFixed(1)} 分
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 评分维度统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle>评分维度统计</CardTitle>
                    <CardDescription>各维度的整体评分情况</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dimensions.map((dimension) => {
                        const allScores = votingResults?.projects.flatMap(item => 
                          item.averageScores[dimension.id] || 0
                        ) || [];
                        const avgScore = allScores.length > 0
                          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
                          : 0;

                        return (
                          <div key={dimension.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{dimension.name}</span>
                              <span className="text-sm text-gray-500">
                                {avgScore.toFixed(1)}/{dimension.maxScore}
                              </span>
                            </div>
                            <Progress value={(avgScore / dimension.maxScore) * 100} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
