import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MoreHorizontal, Filter, Download, Eye, Trash2, AlertTriangle } from 'lucide-react';

// 模拟投票数据
const mockVotes = [
  {
    id: 1,
    voter: '张三',
    voterEmail: 'zhangsan@example.com',
    project: 'AI智能助手',
    projectId: 1,
    scores: {
      innovation: 4.5,
      technical: 4.0,
      practical: 4.2,
      presentation: 3.8,
      impact: 4.1,
    },
    totalScore: 4.12,
    comment: '项目创新性很强，技术实现也比较完善，但演示效果还有提升空间。',
    createdAt: '2024-01-20 14:30',
    status: 'valid',
  },
  {
    id: 2,
    voter: '李四',
    voterEmail: 'lisi@example.com',
    project: '区块链投票系统',
    projectId: 2,
    scores: {
      innovation: 3.8,
      technical: 4.2,
      practical: 3.5,
      presentation: 4.0,
      impact: 3.9,
    },
    totalScore: 3.88,
    comment: '技术方案很好，但实用性还需要考虑。',
    createdAt: '2024-01-21 09:15',
    status: 'valid',
  },
  {
    id: 3,
    voter: '王五',
    voterEmail: 'wangwu@example.com',
    project: 'AI智能助手',
    projectId: 1,
    scores: {
      innovation: 5.0,
      technical: 5.0,
      practical: 5.0,
      presentation: 5.0,
      impact: 5.0,
    },
    totalScore: 5.0,
    comment: '完美的项目！',
    createdAt: '2024-01-21 16:45',
    status: 'suspicious',
  },
];

// 投票统计数据
const voteStats = {
  total: 156,
  today: 23,
  valid: 142,
  suspicious: 14,
  avgScore: 3.85,
  participationRate: 78.5,
};

export function VotesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [votes] = useState(mockVotes);
  const [activeTab, setActiveTab] = useState('all');

  const filteredVotes = votes.filter(vote => {
    const matchesSearch = vote.voter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vote.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vote.voterEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'valid') return matchesSearch && vote.status === 'valid';
    if (activeTab === 'suspicious') return matchesSearch && vote.status === 'suspicious';
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'suspicious':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return '有效';
      case 'suspicious':
        return '可疑';
      default:
        return '未知';
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

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总投票数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voteStats.total}</div>
            <p className="text-xs text-muted-foreground">
              今日 +{voteStats.today}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">有效投票</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voteStats.valid}</div>
            <p className="text-xs text-muted-foreground">
              有效率 {Math.round((voteStats.valid / voteStats.total) * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可疑投票</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{voteStats.suspicious}</div>
            <p className="text-xs text-muted-foreground">
              需要审核
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voteStats.avgScore}</div>
            <p className="text-xs text-muted-foreground">
              满分 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索投票记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 投票列表 */}
      <Card>
        <CardHeader>
          <CardTitle>投票记录</CardTitle>
          <CardDescription>
            查看和管理所有投票记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">全部投票</TabsTrigger>
              <TabsTrigger value="valid">有效投票</TabsTrigger>
              <TabsTrigger value="suspicious" className="text-red-600">
                可疑投票 ({votes.filter(v => v.status === 'suspicious').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>投票者</TableHead>
                    <TableHead>项目</TableHead>
                    <TableHead>总分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>投票时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVotes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vote.voter}</div>
                          <div className="text-sm text-muted-foreground">{vote.voterEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vote.project}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium">{vote.totalScore.toFixed(2)}</span>
                          <span className="text-muted-foreground ml-1">/5.0</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vote.status)}>
                          {vote.status === 'suspicious' && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {getStatusText(vote.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{vote.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            {vote.status === 'suspicious' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600">
                                  标记为有效
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除投票
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
