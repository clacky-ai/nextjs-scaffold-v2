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
import { Search, MoreHorizontal, Plus, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';

// 模拟项目数据
const mockProjects = [
  {
    id: 1,
    title: 'AI智能助手',
    description: '基于大语言模型的智能对话助手',
    author: '张三',
    category: 'AI/ML',
    status: 'approved',
    votesCount: 15,
    avgScore: 4.2,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 2,
    title: '区块链投票系统',
    description: '去中心化的安全投票平台',
    author: '李四',
    category: '区块链',
    status: 'pending',
    votesCount: 8,
    avgScore: 3.8,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-22',
  },
  {
    id: 3,
    title: '智能家居控制系统',
    description: '物联网智能家居解决方案',
    author: '王五',
    category: 'IoT',
    status: 'approved',
    votesCount: 22,
    avgScore: 4.5,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25',
  },
  {
    id: 4,
    title: '在线教育平台',
    description: '互动式在线学习管理系统',
    author: '赵六',
    category: '教育',
    status: 'rejected',
    votesCount: 3,
    avgScore: 2.1,
    createdAt: '2024-01-22',
    updatedAt: '2024-01-24',
  },
];

export function ProjectsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects] = useState(mockProjects);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '待审核';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              +3 较上周
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              通过率 {Math.round((projects.filter(p => p.status === 'approved').length / projects.length) * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              需要处理
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(projects.reduce((sum, p) => sum + p.avgScore, 0) / projects.length).toFixed(1)}
            </div>
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
              placeholder="搜索项目..."
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
            导出
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加项目
          </Button>
        </div>
      </div>

      {/* 项目表格 */}
      <Card>
        <CardHeader>
          <CardTitle>项目列表</CardTitle>
          <CardDescription>
            管理系统中的所有参赛项目
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目信息</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>投票数</TableHead>
                <TableHead>平均分</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{project.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.votesCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{project.avgScore}</span>
                      <span className="text-muted-foreground ml-1">/5.0</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.createdAt}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑项目
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {project.status === 'pending' && (
                          <>
                            <DropdownMenuItem className="text-green-600">
                              批准项目
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              拒绝项目
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
