import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/stores/admin/authStore';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';

// 管理员登录表单验证
const adminLoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const routes = useAdminRoutes();
  const { login, isLoading, error, clearError } = useAdminAuth();

  // 登录表单
  const loginForm = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (data: AdminLoginFormData) => {
    try {
      clearError();
      await login(data.username, data.password);
      // 登录成功后跳转到管理员仪表板
      routes.navigate('dashboard');
    } catch (error: any) {
      // 错误已经在 store 中设置了，这里不需要额外处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">
            登录投票系统管理后台
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入管理员用户名"
                {...loginForm.register('username')}
              />
              {loginForm.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
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
          
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-gray-600 hover:underline">
              用户登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
