import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Medal, 
  Award, 
  Download, 
  BarChart3, 
  TrendingUp,
  Users,
  Vote
} from 'lucide-react';

// 模拟排名数据
const mockRankings = [
  {
    id: 1,
    rank: 1,
    title: 'AI智能助手',
    author: '张三',
    category: 'AI/ML',
    totalVotes: 25,
    avgScore: 4.32,
    scores: {
      innovation: 4.5,
      technical: 4.2,
      practical: 4.1,
      presentation: 4.0,
      impact: 4.8,
    },
  },
  {
    id: 2,
    rank: 2,
    title: '智能家居控制系统',
    author: '王五',
    category: 'IoT',
    totalVotes: 22,
    avgScore: 4.18,
    scores: {
      innovation: 4.0,
      technical: 4.3,
      practical: 4.5,
      presentation: 3.8,
      impact: 4.3,
    },
  },
  {
    id: 3,
    rank: 3,
    title: '区块链投票系统',
    author: '李四',
    category: '区块链',
    totalVotes: 18,
    avgScore: 3.95,
    scores: {
      innovation: 4.2,
      technical: 4.1,
      practical: 3.5,
      presentation: 3.8,
      impact: 4.2,
    },
  },
  {
    id: 4,
    rank: 4,
    title: '在线教育平台',
    author: '赵六',
    category: '教育',
    totalVotes: 15,
    avgScore: 3.72,
    scores: {
      innovation: 3.5,
      technical: 3.8,
      practical: 4.0,
      presentation: 3.6,
      impact: 3.7,
    },
  },
];

// 分类统计数据
const categoryStats = [
  { category: 'AI/ML', projects: 8, avgScore: 4.1, totalVotes: 156 },
  { category: 'IoT', projects: 6, avgScore: 3.9, totalVotes: 124 },
  { category: '区块链', projects: 4, avgScore: 3.8, totalVotes: 89 },
  { category: '教育', projects: 5, avgScore: 3.7, totalVotes: 98 },
  { category: '其他', projects: 3, avgScore: 3.5, totalVotes: 67 },
];

export function ResultsStatistics() {
  const [activeTab, setActiveTab] = useState('rankings');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getDimensionName = (key: string) => {
    const names: Record<string, string> = {
      innovation: '创新性',
      technical: '技术性',
      practical: '实用性',
      presentation: '演示效果',
      impact: '影响力',
    };
    return names[key] || key;
  };

  const exportResults = () => {
    // TODO: 实现导出功能
    console.log('导出结果数据');
  };

  return (
    <div className="space-y-6">
      {/* 总体统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参赛项目</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">
              5个分类
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总投票数</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">534</div>
            <p className="text-xs text-muted-foreground">
              平均每项目 20.5 票
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">178</div>
            <p className="text-xs text-muted-foreground">
              参与率 89.4%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.04</div>
            <p className="text-xs text-muted-foreground">
              满分 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">投票结果统计</h2>
          <p className="text-sm text-muted-foreground">查看详细的投票结果和数据分析</p>
        </div>
        <Button onClick={exportResults}>
          <Download className="h-4 w-4 mr-2" />
          导出报告
        </Button>
      </div>

      {/* 结果展示 */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList>
                <TabsTrigger value="rankings">项目排名</TabsTrigger>
                <TabsTrigger value="categories">分类统计</TabsTrigger>
                <TabsTrigger value="dimensions">维度分析</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="rankings" className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">项目排名</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    根据综合评分排序的项目排名
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">排名</TableHead>
                      <TableHead>项目信息</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>投票数</TableHead>
                      <TableHead>综合评分</TableHead>
                      <TableHead>各维度评分</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRankings.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(project.rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.title}</div>
                            <div className="text-sm text-muted-foreground">{project.author}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.category}</Badge>
                        </TableCell>
                        <TableCell>{project.totalVotes}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium text-lg">{project.avgScore.toFixed(2)}</span>
                            <span className="text-muted-foreground ml-1">/5.0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {Object.entries(project.scores).map(([key, score]) => (
                              <div key={key} className="flex items-center space-x-2 text-xs">
                                <span className="w-16 text-muted-foreground">
                                  {getDimensionName(key)}
                                </span>
                                <Progress value={score * 20} className="w-16 h-1" />
                                <span className="w-8 text-right">{score.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="categories" className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">分类统计</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    各分类的项目数量和评分情况
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryStats.map((stat) => (
                    <Card key={stat.category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{stat.category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">项目数量</span>
                          <span className="font-medium">{stat.projects}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">平均评分</span>
                          <span className="font-medium">{stat.avgScore.toFixed(1)}/5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">总投票数</span>
                          <span className="font-medium">{stat.totalVotes}</span>
                        </div>
                        <Progress value={stat.avgScore * 20} className="w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dimensions" className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">维度分析</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    各评分维度的整体表现分析
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    innovation: { name: '创新性', avg: 4.1, description: '项目的创新程度和独特性' },
                    technical: { name: '技术性', avg: 4.0, description: '技术实现的复杂度和质量' },
                    practical: { name: '实用性', avg: 3.9, description: '项目的实际应用价值' },
                    presentation: { name: '演示效果', avg: 3.7, description: '项目展示和演示的效果' },
                    impact: { name: '影响力', avg: 4.2, description: '项目的潜在影响和价值' },
                  }).map(([key, dimension]) => (
                    <Card key={key}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{dimension.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {dimension.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold">{dimension.avg.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">/5.0</span>
                        </div>
                        <Progress value={dimension.avg * 20} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-2">
                          相对表现: {dimension.avg > 4.0 ? '优秀' : dimension.avg > 3.5 ? '良好' : '一般'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
