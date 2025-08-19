import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FolderOpen, User, Vote, ExternalLink, Github, Eye, EyeOff } from 'lucide-react';
import { AdminLayout, AdminPageLayout, DataTable, Column } from '@/components/admin';
import { useProjectStore } from '@/stores/admin';
import { Project } from '@/stores/admin/types';

export default function AdminProjectsPage() {
  const { 
    filteredProjects, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    fetchProjects, 
    toggleProjectStatus,
    refreshData 
  } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleToggleProjectStatus = async (projectId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const success = await toggleProjectStatus(projectId, newStatus);
    
    if (success) {
      console.log(`项目状态已${newStatus ? '封禁' : '解封'}`);
    } else {
      console.error('更新项目状态失败');
    }
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      title: '项目信息',
      render: (_, record) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {record.imageUrl ? (
              <img 
                src={record.imageUrl} 
                alt={record.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {record.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-2">
              {record.description}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {record.demoUrl && (
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  演示
                </Button>
              )}
              {record.githubUrl && (
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Github className="w-3 h-3 mr-1" />
                  代码
                </Button>
              )}
            </div>
          </div>
        </div>
      ),
      width: '400px'
    },
    {
      key: 'authorName',
      title: '作者',
      render: (value) => (
        <div className="flex items-center text-sm">
          <User className="w-3 h-3 mr-1 text-gray-400" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
      width: '120px'
    },
    {
      key: 'voteCount',
      title: '投票数',
      render: (value) => (
        <div className="flex items-center text-sm">
          <Vote className="w-3 h-3 mr-1 text-gray-400" />
          <span className="text-gray-900 font-medium">{value}</span>
        </div>
      ),
      width: '80px',
      align: 'center'
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </div>
      ),
      width: '120px'
    },
    {
      key: 'isBlocked',
      title: '状态',
      render: (value) => (
        <Badge 
          variant={value ? "destructive" : "default"}
          className="flex items-center space-x-1"
        >
          {value ? (
            <>
              <EyeOff className="w-3 h-3" />
              <span>已隐藏</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>显示中</span>
            </>
          )}
        </Badge>
      ),
      width: '100px',
      align: 'center'
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {record.isBlocked ? '显示' : '隐藏'}
            </span>
            <Switch
              checked={record.isBlocked}
              onCheckedChange={() => handleToggleProjectStatus(record.id, record.isBlocked)}
              disabled={loading.toggleProjectStatus}
            />
          </div>
        </div>
      ),
      width: '120px',
      align: 'center'
    }
  ];

  return (
    <AdminLayout>
      <AdminPageLayout
        title="项目管理"
        description="管理系统中的所有投票项目"
      >
        <DataTable
          columns={columns}
          data={filteredProjects()}
          loading={loading.fetchProjects}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={refreshData}
          emptyText="暂无项目数据"
        />
      </AdminPageLayout>
    </AdminLayout>
  );
}
