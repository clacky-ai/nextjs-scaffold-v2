import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type LoginData, type RegisterData } from "@/hooks/useAuth";
import { Loader2, Vote } from "lucide-react";

// 登录表单schema
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

// 注册表单schema
const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
  realName: z.string().min(1, "请输入真实姓名"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth();

  // 登录表单
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 注册表单
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      realName: "",
      phone: "",
      organization: "",
      department: "",
      position: "",
    },
  });

  const onLogin = (data: LoginData) => {
    login(data);
  };

  const onRegister = (data: RegisterData) => {
    register(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Vote className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">投票系统</h1>
          <p className="text-gray-600 mt-2">专业的项目评选投票平台</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">欢迎使用</CardTitle>
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

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="请输入邮箱"
                      {...loginForm.register("email")}
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
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoginLoading}>
                    {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登录
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱 *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="请输入邮箱"
                      {...registerForm.register("email")}
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
                      placeholder="请输入密码（至少6位）"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-realName">真实姓名 *</Label>
                    <Input
                      id="register-realName"
                      placeholder="请输入真实姓名"
                      {...registerForm.register("realName")}
                    />
                    {registerForm.formState.errors.realName && (
                      <p className="text-sm text-red-600">
                        {registerForm.formState.errors.realName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">手机号</Label>
                    <Input
                      id="register-phone"
                      placeholder="请输入手机号（可选）"
                      {...registerForm.register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-organization">所属机构</Label>
                    <Input
                      id="register-organization"
                      placeholder="请输入所属机构（可选）"
                      {...registerForm.register("organization")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-department">部门</Label>
                    <Input
                      id="register-department"
                      placeholder="请输入部门（可选）"
                      {...registerForm.register("department")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-position">职位</Label>
                    <Input
                      id="register-position"
                      placeholder="请输入职位（可选）"
                      {...registerForm.register("position")}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                    {isRegisterLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    注册
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
