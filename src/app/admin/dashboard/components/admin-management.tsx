'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { UserPlus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else {
        toast.error('获取管理员列表失败')
      }
    } catch (error) {
      console.error('获取管理员列表错误:', error)
      toast.error('获取管理员列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: ''
    })
    setShowPassword(false)
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.name || !formData.email || !formData.password) {
      toast.error('请填写所有字段')
      return
    }

    try {
      setActionLoading('create')
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('管理员创建成功')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchAdmins()
      } else {
        toast.error(data.error || '创建管理员失败')
      }
    } catch (error) {
      console.error('创建管理员错误:', error)
      toast.error('创建管理员失败，请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingAdmin || !formData.username || !formData.name || !formData.email) {
      toast.error('请填写必填字段')
      return
    }

    try {
      setActionLoading('edit')
      const updateData: any = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
      }

      // 只有在提供了新密码时才包含密码字段
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('管理员信息更新成功')
        setIsEditDialogOpen(false)
        setEditingAdmin(null)
        resetForm()
        fetchAdmins()
      } else {
        toast.error(data.error || '更新管理员失败')
      }
    } catch (error) {
      console.error('更新管理员错误:', error)
      toast.error('更新管理员失败，请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`确定要删除管理员 "${adminName}" 吗？此操作不可恢复。`)) {
      return
    }

    try {
      setActionLoading(adminId)
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('管理员删除成功')
        fetchAdmins()
      } else {
        toast.error(data.error || '删除管理员失败')
      }
    } catch (error) {
      console.error('删除管理员错误:', error)
      toast.error('删除管理员失败，请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  const openEditDialog = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      password: ''
    })
    setIsEditDialogOpen(true)
  }

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingAdmin(null)
    resetForm()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">加载管理员列表...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">管理员列表</h3>
          <p className="text-sm text-gray-500">共 {admins.length} 个管理员账号</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              添加管理员
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加新管理员</DialogTitle>
              <DialogDescription>
                创建一个新的管理员账号
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">用户名</Label>
                <Input
                  id="create-username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="请输入用户名"
                  disabled={actionLoading === 'create'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">姓名</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入姓名"
                  disabled={actionLoading === 'create'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">邮箱</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="请输入邮箱"
                  disabled={actionLoading === 'create'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">密码</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    className="pr-10"
                    disabled={actionLoading === 'create'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={actionLoading === 'create'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateDialog}
                  disabled={actionLoading === 'create'}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? '创建中...' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 管理员列表 */}
      <Card>
        <CardHeader>
          <CardTitle>管理员账号</CardTitle>
          <CardDescription>
            管理所有管理员账号信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="font-medium">{admin.username}</div>
                  </TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {new Date(admin.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(admin)}
                        disabled={actionLoading !== null}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === admin.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {admins.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无管理员账号</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑管理员对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑管理员</DialogTitle>
            <DialogDescription>
              修改管理员账号信息，密码留空则不修改
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">用户名</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名"
                disabled={actionLoading === 'edit'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入姓名"
                disabled={actionLoading === 'edit'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入邮箱"
                disabled={actionLoading === 'edit'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">新密码（可选）</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="留空则不修改密码"
                  className="pr-10"
                  disabled={actionLoading === 'edit'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={actionLoading === 'edit'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={actionLoading === 'edit'}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={actionLoading === 'edit'}
              >
                {actionLoading === 'edit' ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
