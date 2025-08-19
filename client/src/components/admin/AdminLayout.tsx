import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useNavigationStore } from '@/stores/admin/navigationStore';
import { useAdminAuth, useAdminUser } from '@/stores/admin/authStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAdminAuth();
  const adminUser = useAdminUser();
  const { isCollapsed, isMobileOpen, setMobileOpen } = useNavigationStore();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [setMobileOpen]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden mr-2"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Page Title - will be updated by individual pages */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  投票系统管理后台
                </h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {adminUser?.name || '管理员'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {adminUser?.email}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出登录</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
