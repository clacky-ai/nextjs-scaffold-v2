import { useEffect, useState } from 'react';
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
import { Search, MoreHorizontal, Filter, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import { useAdminVoteStore } from '@/stores/admin/voteStore';

export function VotesManagement() {
  const {
    votes,
    loading,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    fetchVotes,
    deleteVote,
    markVoteAsValid,
    stats,
    filteredVotes,
  } = useAdminVoteStore();

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleDeleteVote = async (voteId: string) => {
    if (confirm('确定要删除这个投票吗？')) {
      const success = await deleteVote(voteId);
      if (success) {
        console.log('投票删除成功');
      }
    }
  };

  const handleMarkAsValid = async (voteId: string) => {
    const success = await markVoteAsValid(voteId);
    if (success) {
      console.log('投票标记为有效');
    }
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
            <div className="text-2xl font-bold">{stats().total}</div>
            <p className="text-xs text-muted-foreground">
              今日 +{stats().today}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">有效投票</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().valid}</div>
            <p className="text-xs text-muted-foreground">
              有效率 {stats().total > 0 ? Math.round((stats().valid / stats().total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可疑投票</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats().suspicious}</div>
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
            <div className="text-2xl font-bold">{stats().avgScore}</div>
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
                可疑投票 (0)
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
                  {loading.fetchVotes ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">加载投票数据中...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredVotes().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">暂无投票数据</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVotes().map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vote.userName}</div>
                            <div className="text-sm text-muted-foreground">投票用户</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{vote.projectTitle}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">-</span>
                            <span className="text-muted-foreground ml-1">/5.0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            有效
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(vote.createdAt).toLocaleDateString()}</TableCell>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteVote(vote.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除投票
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
