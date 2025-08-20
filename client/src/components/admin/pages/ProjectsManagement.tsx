import { useEffect } from 'react';
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
import { Search, MoreHorizontal, Plus, Filter, Download, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { useAdminProjectStore } from '@/stores/admin/projectStore';

export function ProjectsManagement() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    fetchProjects,
    toggleProjectStatus,
    deleteProject,
    stats,
    filteredProjects,
  } = useAdminProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleToggleStatus = async (projectId: string, isBlocked: boolean) => {
    const success = await toggleProjectStatus(projectId, isBlocked);
    if (success) {
      console.log('项目状态更新成功');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      const success = await deleteProject(projectId);
      if (success) {
        console.log('项目删除成功');
      }
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
            <div className="text-2xl font-bold">{stats().total}</div>
            <p className="text-xs text-muted-foreground">
              项目总数
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">正常项目</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().approved}</div>
            <p className="text-xs text-muted-foreground">
              通过率 {stats().total > 0 ? Math.round((stats().approved / stats().total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">被屏蔽项目</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats().rejected}</div>
            <p className="text-xs text-muted-foreground">
              需要关注
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
              {loading.fetchProjects ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">加载项目数据中...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProjects().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">暂无项目数据</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects().map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{project.authorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">未分类</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={project.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {project.isBlocked ? '已屏蔽' : '正常'}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.voteCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">-</span>
                        <span className="text-muted-foreground ml-1">/5.0</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(project.id, project.isBlocked)}
                            className={project.isBlocked ? 'text-green-600' : 'text-red-600'}
                          >
                            {project.isBlocked ? '解除屏蔽' : '屏蔽项目'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除项目
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
