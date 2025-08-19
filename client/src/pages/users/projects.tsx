import { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/users/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, ExternalLink, Github, FileText, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProjectsPage() {
  const {
    projects,
    categories,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    selectedCategory,
    searchQuery,
    statusFilter,
    fetchProjects,
    fetchCategories,
    setCurrentPage,
    setSelectedCategory,
    setSearchQuery,
    setStatusFilter,
    clearError,
    resetFilters,
  } = useProjectStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    fetchCategories();
    fetchProjects();
  }, [fetchCategories, fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, selectedCategory, statusFilter, fetchProjects]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? null : value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === 'all' ? null : value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setLocalSearchQuery('');
    resetFilters();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '草稿', variant: 'secondary' as const },
      submitted: { label: '已提交', variant: 'default' as const },
      published: { label: '已发布', variant: 'default' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载项目列表...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">项目列表</h1>
              <p className="text-gray-600 mt-1">浏览所有参赛项目</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              提交项目
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              搜索和筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="搜索项目标题或描述..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="submitted">已提交</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                共找到 {total} 个项目
              </p>
              <Button variant="outline" onClick={handleReset}>
                重置筛选
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* 项目列表 */}
        {projects.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无项目</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery || selectedCategory || statusFilter
                  ? '没有找到符合条件的项目，请尝试调整搜索条件'
                  : '还没有项目提交，成为第一个提交者吧！'}
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
                      {project.tags.slice(0, 3).map((tag, index) => (
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
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                上一页
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
        
        {isLoading && projects.length > 0 && (
          <div className="flex justify-center mt-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
