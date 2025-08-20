import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Users, 
  Vote,
  Database,
  Mail,
  Shield
} from 'lucide-react';

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  // 模拟设置数据
  const [settings, setSettings] = useState({
    general: {
      systemName: '投票评选系统',
      systemDescription: '一个功能完整的投票评选系统',
      maxVotesPerUser: 3,
      enableRegistration: true,
      enableVoting: true,
      enableResults: false,
    },
    voting: {
      votingStartDate: '2024-02-01',
      votingEndDate: '2024-02-28',
      enableAnonymousVoting: false,
      requireComment: true,
      minCommentLength: 10,
      enableSelfVoting: false,
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'noreply@example.com',
      smtpPassword: '********',
      enableEmailNotifications: true,
      enableVoteConfirmation: true,
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      enableAuditLog: true,
      enableIpWhitelist: false,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: 实现保存设置的API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log('设置已保存', settings);
  };

  const handleReset = () => {
    // TODO: 重置为默认设置
    console.log('重置设置');
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">系统设置</h2>
          <p className="text-sm text-muted-foreground">配置系统参数和选项</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 设置内容 */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" />
                  基本设置
                </TabsTrigger>
                <TabsTrigger value="voting">
                  <Vote className="h-4 w-4 mr-2" />
                  投票设置
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  邮件设置
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  安全设置
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">基本设置</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">系统名称</Label>
                      <Input
                        id="systemName"
                        value={settings.general.systemName}
                        onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxVotes">每用户最大投票数</Label>
                      <Input
                        id="maxVotes"
                        type="number"
                        value={settings.general.maxVotesPerUser}
                        onChange={(e) => updateSetting('general', 'maxVotesPerUser', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="systemDescription">系统描述</Label>
                    <Textarea
                      id="systemDescription"
                      value={settings.general.systemDescription}
                      onChange={(e) => updateSetting('general', 'systemDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">功能开关</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>用户注册</Label>
                        <p className="text-sm text-muted-foreground">允许新用户注册账户</p>
                      </div>
                      <Switch
                        checked={settings.general.enableRegistration}
                        onCheckedChange={(checked) => updateSetting('general', 'enableRegistration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>投票功能</Label>
                        <p className="text-sm text-muted-foreground">启用或禁用投票功能</p>
                      </div>
                      <Switch
                        checked={settings.general.enableVoting}
                        onCheckedChange={(checked) => updateSetting('general', 'enableVoting', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>结果展示</Label>
                        <p className="text-sm text-muted-foreground">公开显示投票结果</p>
                      </div>
                      <Switch
                        checked={settings.general.enableResults}
                        onCheckedChange={(checked) => updateSetting('general', 'enableResults', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voting" className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">投票设置</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">投票开始时间</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={settings.voting.votingStartDate}
                        onChange={(e) => updateSetting('voting', 'votingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">投票结束时间</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={settings.voting.votingEndDate}
                        onChange={(e) => updateSetting('voting', 'votingEndDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minComment">最小评论长度</Label>
                    <Input
                      id="minComment"
                      type="number"
                      value={settings.voting.minCommentLength}
                      onChange={(e) => updateSetting('voting', 'minCommentLength', parseInt(e.target.value))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">投票规则</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>匿名投票</Label>
                        <p className="text-sm text-muted-foreground">隐藏投票者身份</p>
                      </div>
                      <Switch
                        checked={settings.voting.enableAnonymousVoting}
                        onCheckedChange={(checked) => updateSetting('voting', 'enableAnonymousVoting', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>强制评论</Label>
                        <p className="text-sm text-muted-foreground">投票时必须填写评论</p>
                      </div>
                      <Switch
                        checked={settings.voting.requireComment}
                        onCheckedChange={(checked) => updateSetting('voting', 'requireComment', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>允许自投</Label>
                        <p className="text-sm text-muted-foreground">允许为自己的项目投票</p>
                      </div>
                      <Switch
                        checked={settings.voting.enableSelfVoting}
                        onCheckedChange={(checked) => updateSetting('voting', 'enableSelfVoting', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">邮件设置</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP 服务器</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">端口</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">用户名</Label>
                      <Input
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">密码</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">通知设置</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>邮件通知</Label>
                        <p className="text-sm text-muted-foreground">启用邮件通知功能</p>
                      </div>
                      <Switch
                        checked={settings.email.enableEmailNotifications}
                        onCheckedChange={(checked) => updateSetting('email', 'enableEmailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>投票确认</Label>
                        <p className="text-sm text-muted-foreground">投票后发送确认邮件</p>
                      </div>
                      <Switch
                        checked={settings.email.enableVoteConfirmation}
                        onCheckedChange={(checked) => updateSetting('email', 'enableVoteConfirmation', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">安全设置</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">会话超时 (小时)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">最大登录尝试次数</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">安全功能</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>双因素认证</Label>
                        <p className="text-sm text-muted-foreground">启用双因素认证</p>
                      </div>
                      <Switch
                        checked={settings.security.enableTwoFactor}
                        onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>审计日志</Label>
                        <p className="text-sm text-muted-foreground">记录系统操作日志</p>
                      </div>
                      <Switch
                        checked={settings.security.enableAuditLog}
                        onCheckedChange={(checked) => updateSetting('security', 'enableAuditLog', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP 白名单</Label>
                        <p className="text-sm text-muted-foreground">启用 IP 访问限制</p>
                      </div>
                      <Switch
                        checked={settings.security.enableIpWhitelist}
                        onCheckedChange={(checked) => updateSetting('security', 'enableIpWhitelist', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
