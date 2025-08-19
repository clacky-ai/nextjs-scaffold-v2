import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, User, Lock, Bell, Database } from 'lucide-react';
import { AdminLayout, AdminPageLayout } from '@/components/admin';
import { useAdminUser } from '@/stores/admin/authStore';

export default function AdminSettingsPage() {
  const adminUser = useAdminUser();
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    isVotingEnabled: true,
    maxVotesPerUser: 3,
    allowAnonymousVoting: false,
    requireVoteReason: true,
  });

  // Admin profile state
  const [profileData, setProfileData] = useState({
    name: adminUser?.name || '',
    email: adminUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserNotifications: true,
    newProjectNotifications: true,
    systemAlerts: true,
  });

  const handleSystemSettingsSave = async () => {
    try {
      // TODO: Implement API call to save system settings
      console.log('Saving system settings:', systemSettings);
      // You can add toast notification here
    } catch (error) {
      console.error('Error saving system settings:', error);
    }
  };

  const handleProfileSave = async () => {
    try {
      // TODO: Implement API call to update admin profile
      console.log('Saving profile data:', profileData);
      // You can add toast notification here
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleNotificationSettingsSave = async () => {
    try {
      // TODO: Implement API call to save notification settings
      console.log('Saving notification settings:', notificationSettings);
      // You can add toast notification here
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  return (
    <AdminLayout>
      <AdminPageLayout
        title="系统设置"
        description="管理系统配置和管理员账户设置"
      >
        <div className="space-y-6">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                系统设置
              </CardTitle>
              <CardDescription>
                配置投票系统的基本参数和规则
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">启用投票功能</Label>
                  <div className="text-sm text-gray-500">
                    控制用户是否可以进行投票
                  </div>
                </div>
                <Switch
                  checked={systemSettings.isVotingEnabled}
                  onCheckedChange={(checked) =>
                    setSystemSettings(prev => ({ ...prev, isVotingEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="maxVotes">每用户最大投票数</Label>
                <Input
                  id="maxVotes"
                  type="number"
                  min="1"
                  max="10"
                  value={systemSettings.maxVotesPerUser}
                  onChange={(e) =>
                    setSystemSettings(prev => ({ 
                      ...prev, 
                      maxVotesPerUser: parseInt(e.target.value) || 1 
                    }))
                  }
                  className="w-32"
                />
                <div className="text-sm text-gray-500">
                  限制每个用户最多可以投票的项目数量
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">允许匿名投票</Label>
                  <div className="text-sm text-gray-500">
                    用户可以选择匿名进行投票
                  </div>
                </div>
                <Switch
                  checked={systemSettings.allowAnonymousVoting}
                  onCheckedChange={(checked) =>
                    setSystemSettings(prev => ({ ...prev, allowAnonymousVoting: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">要求投票理由</Label>
                  <div className="text-sm text-gray-500">
                    用户投票时必须填写投票理由
                  </div>
                </div>
                <Switch
                  checked={systemSettings.requireVoteReason}
                  onCheckedChange={(checked) =>
                    setSystemSettings(prev => ({ ...prev, requireVoteReason: checked }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSystemSettingsSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存系统设置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                管理员资料
              </CardTitle>
              <CardDescription>
                更新您的个人信息和登录凭据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">姓名</Label>
                  <Input
                    id="adminName"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">邮箱</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData(prev => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  修改密码
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) =>
                        setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData(prev => ({ ...prev, newPassword: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) =>
                        setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存个人资料
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                通知设置
              </CardTitle>
              <CardDescription>
                配置系统通知和提醒偏好
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">邮件通知</Label>
                  <div className="text-sm text-gray-500">
                    接收系统相关的邮件通知
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">新用户注册通知</Label>
                  <div className="text-sm text-gray-500">
                    有新用户注册时接收通知
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.newUserNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, newUserNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">新项目提交通知</Label>
                  <div className="text-sm text-gray-500">
                    有新项目提交时接收通知
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.newProjectNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, newProjectNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">系统警报</Label>
                  <div className="text-sm text-gray-500">
                    接收系统错误和重要警报
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSettingsSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存通知设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPageLayout>
    </AdminLayout>
  );
}
