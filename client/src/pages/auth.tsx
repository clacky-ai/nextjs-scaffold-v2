import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Vote, Users, Trophy, BarChart3 } from 'lucide-react';
import { useAuth } from '@/stores/authStore';

// 登录表单验证
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
});

// 注册表单验证
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  realName: z.string().min(1, '请输入真实姓名'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register, isLoading, error, clearError } = useAuth();

  // 登录表单
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 注册表单
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      realName: '',
      phone: '',
      organization: '',
      department: '',
      position: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
    } catch (error: any) {
      // 错误已经在 store 中设置了，这里不需要额外处理
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      clearError();
      await register(data);
    } catch (error: any) {
      // 错误已经在 store 中设置了，这里不需要额外处理
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 左侧：系统介绍 */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              投票评选系统
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              公平、透明、高效的项目评选平台
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Vote className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">智能投票</h3>
                <p className="text-gray-600 text-sm">每人3票限制，防自投机制，多维度评分</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">实名制</h3>
                <p className="text-gray-600 text-sm">真实身份验证，确保投票公正性</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">项目管理</h3>
                <p className="text-gray-600 text-sm">便捷的项目提交和分类管理</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">实时统计</h3>
                <p className="text-gray-600 text-sm">实时结果展示和数据分析</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：登录/注册表单 */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">欢迎使用投票系统</CardTitle>
              <CardDescription className="text-center">
                请登录或注册您的账户
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">邮箱</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="请输入邮箱"
                        {...loginForm.register('email')}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">密码</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="请输入密码"
                        {...loginForm.register('password')}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      登录
                    </Button>
                  </form>

                  <div className="text-center text-sm text-gray-600">
                    <p>测试账号：</p>
                    <p>admin@voting.com / admin123456</p>
                    <p>user1@example.com / password123</p>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">邮箱 *</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="请输入邮箱"
                          {...registerForm.register('email')}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">密码 *</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="至少6个字符"
                          {...registerForm.register('password')}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-realName">真实姓名 *</Label>
                      <Input
                        id="register-realName"
                        placeholder="请输入真实姓名"
                        {...registerForm.register('realName')}
                      />
                      {registerForm.formState.errors.realName && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.realName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">手机号</Label>
                        <Input
                          id="register-phone"
                          placeholder="请输入手机号"
                          {...registerForm.register('phone')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-organization">所属组织</Label>
                        <Input
                          id="register-organization"
                          placeholder="公司/学校等"
                          {...registerForm.register('organization')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-department">部门</Label>
                        <Input
                          id="register-department"
                          placeholder="所属部门"
                          {...registerForm.register('department')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-position">职位</Label>
                        <Input
                          id="register-position"
                          placeholder="职位/职称"
                          {...registerForm.register('position')}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      注册
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
