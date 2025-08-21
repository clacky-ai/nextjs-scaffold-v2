import { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/users/projectStore';
import { useAuth } from '@/stores/users/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, ExternalLink, Github, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const {
    projects,
    categories,
    isLoading,
    error,
    fetchProjects,
    fetchCategories,
    deleteProject,
    clearError,
  } = useProjectStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  // 过滤出当前用户的项目
  const myProjects = projects.filter(project => project.submitterId === user?.id);

  useEffect(() => {
    fetchCategories();
    fetchProjects(); // 获取所有项目，然后在客户端过滤
  }, [fetchCategories, fetchProjects]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '草稿', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      submitted: { label: '已提交', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      published: { label: '已发布', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      // 错误已在store中处理
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载我的项目...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">我的项目</h1>
              <p className="text-gray-600 mt-1">管理您提交的项目</p>
            </div>
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                提交新项目
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription className="flex justify-between items-center">
              {error}
              <Button variant="outline" size="sm" onClick={clearError}>
                关闭
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 项目统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">草稿</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {myProjects.filter(p => p.status === 'draft').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已提交</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {myProjects.filter(p => p.status === 'submitted').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {myProjects.filter(p => p.status === 'published').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 项目列表 */}
        {myProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">您还没有提交任何项目</p>
              <p className="text-gray-400 text-sm mt-2">
                点击上方按钮提交您的第一个项目
              </p>
              <Button className="mt-4" asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  提交新项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
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
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          查看
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}/edit`}>
                          <Edit className="h-3 w-3 mr-1" />
                          编辑
                        </Link>
                      </Button>
                      
                      <Dialog open={deleteDialogOpen && projectToDelete?.id === project.id} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setProjectToDelete(project)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>确认删除项目</DialogTitle>
                            <DialogDescription>
                              您确定要删除项目 "{project.title}" 吗？此操作无法撤销。
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setDeleteDialogOpen(false);
                                setProjectToDelete(null);
                              }}
                            >
                              取消
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteProject}
                              disabled={isLoading}
                            >
                              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              确认删除
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
