import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Users, UserCheck, UserX, Mail, Phone, Building } from 'lucide-react';
import { AdminLayout, AdminPageLayout, DataTable, Column } from '@/components/admin';
import { useUserStore } from '@/stores/admin';
import { User } from '@/stores/admin/types';

export default function AdminUsersPage() {
  const { 
    filteredUsers, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    fetchUsers, 
    toggleUserStatus,
    refreshData 
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const success = await toggleUserStatus(userId, newStatus);
    
    if (success) {
      // You can add toast notification here
      console.log(`用户状态已${newStatus ? '封禁' : '解封'}`);
    } else {
      // You can add error toast notification here
      console.error('更新用户状态失败');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: '用户信息',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {record.name}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {record.email}
            </div>
          </div>
        </div>
      ),
      width: '300px'
    },
    {
      key: 'phone',
      title: '联系方式',
      render: (_, record) => (
        <div className="text-sm">
          {record.phone ? (
            <div className="flex items-center text-gray-900">
              <Phone className="w-3 h-3 mr-1" />
              {record.phone}
            </div>
          ) : (
            <span className="text-gray-400">未填写</span>
          )}
        </div>
      ),
      width: '150px'
    },
    {
      key: 'team',
      title: '团队/组织',
      render: (_, record) => (
        <div className="text-sm">
          {record.team ? (
            <div className="flex items-center text-gray-900">
              <Building className="w-3 h-3 mr-1" />
              {record.team}
            </div>
          ) : (
            <span className="text-gray-400">未填写</span>
          )}
        </div>
      ),
      width: '150px'
    },
    {
      key: 'createdAt',
      title: '注册时间',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
      width: '150px'
    },
    {
      key: 'isBlocked',
      title: '状态',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={value ? "destructive" : "default"}
            className="flex items-center space-x-1"
          >
            {value ? (
              <>
                <UserX className="w-3 h-3" />
                <span>已封禁</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3 h-3" />
                <span>正常</span>
              </>
            )}
          </Badge>
        </div>
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
              {record.isBlocked ? '解封' : '封禁'}
            </span>
            <Switch
              checked={record.isBlocked}
              onCheckedChange={() => handleToggleUserStatus(record.id, record.isBlocked)}
              disabled={loading.toggleUserStatus}
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
        title="用户管理"
        description="管理系统中的所有用户账户"
      >
        <DataTable
          columns={columns}
          data={filteredUsers()}
          loading={loading.fetchUsers}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={refreshData}
          emptyText="暂无用户数据"
        />
      </AdminPageLayout>
    </AdminLayout>
  );
}
