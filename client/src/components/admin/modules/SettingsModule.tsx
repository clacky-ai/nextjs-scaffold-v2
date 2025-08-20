import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, User, Lock, Bell, Database } from 'lucide-react';
import { useAdminUser } from '@/stores/admin/authStore';

export function SettingsModule() {
  const adminUser = useAdminUser();
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: adminUser?.name || '',
    email: adminUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    allowUserRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    autoBackup: true,
    maintenanceMode: false
  });

  const handleProfileSave = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', profileData);
  };

  const handleSystemSave = () => {
    // TODO: Implement system settings update
    console.log('Saving system settings:', systemSettings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
        <p className="text-sm text-gray-600 mt-1">管理系统配置和个人设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              个人资料
            </CardTitle>
            <CardDescription>
              更新您的个人信息和密码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入姓名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="请输入邮箱"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={profileData.currentPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="请输入当前密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="请输入新密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="请再次输入新密码"
              />
            </div>

            <Button onClick={handleProfileSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              保存个人资料
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              系统设置
            </CardTitle>
            <CardDescription>
              配置系统行为和功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Registration */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>允许用户注册</Label>
                <p className="text-sm text-gray-500">允许新用户自主注册账户</p>
              </div>
              <Switch
                checked={systemSettings.allowUserRegistration}
                onCheckedChange={(checked) => 
                  setSystemSettings(prev => ({ ...prev, allowUserRegistration: checked }))
                }
              />
            </div>

            <Separator />

            {/* Email Verification */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>邮箱验证</Label>
                <p className="text-sm text-gray-500">要求用户验证邮箱地址</p>
              </div>
              <Switch
                checked={systemSettings.requireEmailVerification}
                onCheckedChange={(checked) => 
                  setSystemSettings(prev => ({ ...prev, requireEmailVerification: checked }))
                }
              />
            </div>

            <Separator />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center">
                  <Bell className="h-4 w-4 mr-1" />
                  系统通知
                </Label>
                <p className="text-sm text-gray-500">启用系统通知功能</p>
              </div>
              <Switch
                checked={systemSettings.enableNotifications}
                onCheckedChange={(checked) => 
                  setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))
                }
              />
            </div>

            <Separator />

            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  自动备份
                </Label>
                <p className="text-sm text-gray-500">定期自动备份数据</p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => 
                  setSystemSettings(prev => ({ ...prev, autoBackup: checked }))
                }
              />
            </div>

            <Separator />

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  维护模式
                </Label>
                <p className="text-sm text-gray-500">启用维护模式，暂停用户访问</p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>

            <Button onClick={handleSystemSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              保存系统设置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
