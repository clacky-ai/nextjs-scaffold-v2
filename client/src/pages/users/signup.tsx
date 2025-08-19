import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/stores/users/authStore';

// 注册表单验证
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string().min(6, '密码至少需要6个字符'),
  realName: z.string().min(1, '请输入真实姓名'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码确认不匹配",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function UserSignupPage() {
  const [, setLocation] = useLocation();
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  // 注册表单
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      realName: '',
      phone: '',
      organization: '',
      department: '',
      position: '',
    },
  });

  const handleRegister = async (data: RegisterFormData) => {
    try {
      clearError();
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      // 注册成功后跳转到登录页
      setLocation('/login');
    } catch (error: any) {
      // 错误已经在 store 中设置了，这里不需要额外处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">用户注册</CardTitle>
          <CardDescription className="text-center">
            创建您的投票系统账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName">姓名 *</Label>
              <Input
                id="realName"
                type="text"
                placeholder="请输入您的真实姓名"
                {...registerForm.register('realName')}
              />
              {registerForm.formState.errors.realName && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.realName.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱地址"
                {...registerForm.register('email')}
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                {...registerForm.register('password')}
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                {...registerForm.register('confirmPassword')}
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入联系电话"
                {...registerForm.register('phone')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">所属组织</Label>
              <Input
                id="organization"
                type="text"
                placeholder="公司/学校等"
                {...registerForm.register('organization')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">部门</Label>
              <Input
                id="department"
                type="text"
                placeholder="所属部门"
                {...registerForm.register('department')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">职位</Label>
              <Input
                id="position"
                type="text"
                placeholder="职位/职称"
                {...registerForm.register('position')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              注册
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            已有账号？{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
