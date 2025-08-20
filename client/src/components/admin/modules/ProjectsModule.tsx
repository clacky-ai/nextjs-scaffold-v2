import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FolderOpen, User, Vote, ExternalLink, Github, Eye, EyeOff } from 'lucide-react';
import { DataTable, Column } from '@/components/admin';
import { useProjectStore } from '@/stores/admin';
import { Project } from '@/stores/admin/types';

export function ProjectsModule() {
  const { projects, fetchProjects, updateProject, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleToggleVisibility = async (projectId: string, currentVisibility: boolean) => {
    try {
      await updateProject(projectId, { isPublic: !currentVisibility });
      await fetchProjects(); // Refresh the list
    } catch (error) {
      console.error('Failed to update project visibility:', error);
    }
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      title: '项目名称',
      render: (project) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{project.title}</div>
            <div className="text-sm text-gray-500">ID: {project.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'author',
      title: '创建者',
      render: (project) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{project.author?.name || '未知用户'}</span>
        </div>
      )
    },
    {
      key: 'voteCount',
      title: '投票数',
      render: (project) => (
        <div className="flex items-center space-x-2">
          <Vote className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{project.voteCount || 0}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: '状态',
      render: (project) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'active': return 'default';
            case 'completed': return 'secondary';
            case 'draft': return 'outline';
            default: return 'destructive';
          }
        };

        const getStatusText = (status: string) => {
          switch (status) {
            case 'active': return '进行中';
            case 'completed': return '已完成';
            case 'draft': return '草稿';
            default: return '未知';
          }
        };

        return (
          <Badge variant={getStatusColor(project.status) as any}>
            {getStatusText(project.status)}
          </Badge>
        );
      }
    },
    {
      key: 'isPublic',
      title: '可见性',
      render: (project) => (
        <div className="flex items-center space-x-2">
          {project.isPublic ? (
            <>
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">公开</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">私有</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (project) => (
        <span className="text-sm text-gray-500">
          {new Date(project.createdAt).toLocaleDateString('zh-CN')}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (project) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={project.isPublic}
            onCheckedChange={() => handleToggleVisibility(project.id, project.isPublic)}
            size="sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (project.githubUrl) {
                window.open(project.githubUrl, '_blank');
              }
            }}
            disabled={!project.githubUrl}
          >
            <Github className="h-4 w-4 mr-1" />
            GitHub
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (project.demoUrl) {
                window.open(project.demoUrl, '_blank');
              }
            }}
            disabled={!project.demoUrl}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            演示
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">项目管理</h2>
        <p className="text-sm text-gray-600 mt-1">管理系统中的所有投票项目</p>
      </div>

      {/* Data Table */}
      <DataTable
        data={projects}
        columns={columns}
        loading={isLoading.fetchProjects}
        emptyMessage="暂无项目数据"
      />
    </div>
  );
}
