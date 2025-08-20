import { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { Bell, Settings, LogOut, User, Menu } from 'lucide-react';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';
import { useNavigationStore } from '@/stores/admin/navigationStore';

export interface AdminContentLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminContentLayout({
  children
}: AdminContentLayoutProps) {
  const routes = useAdminRoutes();
  const { toggleSidebar } = useSidebar();
  const { breadcrumbs } = useNavigationStore();

  const handleLogout = () => {
    // TODO: 实现登出逻辑
    routes.navigate('login', {}, { replace: true });
  };

  const handleProfile = () => {
    // TODO: 实现个人资料页面
    console.log('打开个人资料');
  };

  const handleSettings = () => {
    routes.navigate('settings');
  };

  const handleGoToDashboard = () => {
    routes.navigate('dashboard');
  };

  const handleBreadcrumbClick = (path: string) => {
    // 根据精确路径找到对应的路由键并导航
    const routeKey = routes.routes.getRouteKeyByExactPath(path);
    if (routeKey) {
      routes.navigate(routeKey as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header - 固定高度 */}
      <header className="bg-white border-b px-6 h-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* 收折按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* 面包屑导航 */}
          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem key={index}>
                      {item.path && index < breadcrumbs.length - 1 ? (
                        <BreadcrumbLink 
                          onClick={() => handleBreadcrumbClick(item.path!)}
                          className="cursor-pointer"
                        >
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>

        {/* 右侧操作区域 */}
        <div className="flex items-center space-x-4">
          {/* 通知按钮 */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button> */}

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/admin.png" alt="管理员" />
                  <AvatarFallback>管</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">管理员</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>系统设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 主要内容区域 - 可滚动 */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
