'use client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUserStore } from '@/stores/admin'

interface UserManagementProps {
  onStatsUpdate: () => void
  onUserSelect?: (userId: string) => void
  searchTerm?: string
}

export function UserManagement({ onStatsUpdate, onUserSelect, searchTerm = '' }: UserManagementProps) {
  const {
    users,
    loading,
    toggleUserStatus
  } = useUserStore()
  
  const isLoading = loading.fetchUsers

  const handleToggleUserStatus = async (userId: string, isBlocked: boolean) => {
    const success = await toggleUserStatus(userId, isBlocked)
    if (success && onStatsUpdate) {
      onStatsUpdate()
    }
  }

  // 使用 store 的过滤功能，但支持本地 searchTerm
  const displayUsers = searchTerm 
    ? users.filter(user => {
        const searchLower = searchTerm.toLowerCase()
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
          (user.team && user.team.toLowerCase().includes(searchLower))
        )
      })
    : users

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {searchTerm ? (
          <>
            搜索到 {displayUsers.length} 个用户，共 {users.length} 个用户
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                搜索: "{searchTerm}"
              </span>
            )}
          </>
        ) : (
          <>共 {users.length} 个用户，其中 {users.filter(u => !u.isBlocked).length} 个活跃用户</>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>团队</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.length > 0 ? (
              displayUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {onUserSelect ? (
                    <button
                      onClick={() => onUserSelect(user.id)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {user.name}
                    </button>
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.team || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                    {user.isBlocked ? '已屏蔽' : '正常'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.isBlocked ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => handleToggleUserStatus(user.id, user.isBlocked)}
                    disabled={loading[`toggleUser_${user.id}`]}
                  >
                    {loading[`toggleUser_${user.id}`] 
                      ? '处理中...' 
                      : user.isBlocked ? '恢复' : '屏蔽'
                    }
                  </Button>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? `没有找到匹配 "${searchTerm}" 的用户` : '暂无用户数据'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
