import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Users, UserCheck, UserX, Mail, Phone, Building } from 'lucide-react';
import { DataTable, Column } from '@/components/admin';
import { useUserStore } from '@/stores/admin';
import { User } from '@/stores/admin/types';

export function UsersModule() {
  const { users, fetchUsers, updateUser, isLoading } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUser(userId, { isActive: !currentStatus });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: '用户名',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: '邮箱',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{user.email}</span>
        </div>
      )
    },
    {
      key: 'phone',
      title: '电话',
      render: (user) => user.phone ? (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{user.phone}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">未提供</span>
      )
    },
    {
      key: 'company',
      title: '公司',
      render: (user) => user.company ? (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{user.company}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">未提供</span>
      )
    },
    {
      key: 'isActive',
      title: '状态',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Badge variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                活跃
              </>
            ) : (
              <>
                <UserX className="h-3 w-3 mr-1" />
                已封禁
              </>
            )}
          </Badge>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: '注册时间',
      render: (user) => (
        <span className="text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={user.isActive}
            onCheckedChange={() => handleToggleStatus(user.id, user.isActive)}
            size="sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement user details view
              console.log('View user details:', user.id);
            }}
          >
            查看详情
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
        <p className="text-sm text-gray-600 mt-1">管理系统中的所有用户账户</p>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={isLoading.fetchUsers}
        emptyMessage="暂无用户数据"
      />
    </div>
  );
}
