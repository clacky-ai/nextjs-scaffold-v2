import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Vote, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigationStore } from '@/stores/admin/navigationStore';
import { MenuItem } from '@/stores/admin/types';

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: '概览',
    path: '/admin',
    icon: LayoutDashboard,
    description: '系统概览和统计信息'
  },
  {
    id: 'users',
    label: '用户管理',
    path: '/admin/users',
    icon: Users,
    description: '管理系统用户'
  },
  {
    id: 'projects',
    label: '项目管理',
    path: '/admin/projects',
    icon: FolderOpen,
    description: '管理投票项目'
  },
  {
    id: 'votes',
    label: '投票管理',
    path: '/admin/votes',
    icon: Vote,
    description: '管理投票记录'
  },
  {
    id: 'settings',
    label: '设置',
    path: '/admin/settings',
    icon: Settings,
    description: '系统设置'
  }
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [location] = useLocation();
  const { 
    activeTab, 
    isCollapsed, 
    isMobileOpen,
    setActiveTab, 
    setMenuItems, 
    setCollapsed,
    setMobileOpen,
    setActiveTabByPath,
    generateBreadcrumbs
  } = useNavigationStore();

  // Initialize menu items
  useEffect(() => {
    setMenuItems(menuItems);
  }, [setMenuItems]);

  // Update active tab based on current path
  useEffect(() => {
    setActiveTabByPath(location);
    generateBreadcrumbs(location);
  }, [location, setActiveTabByPath, generateBreadcrumbs]);

  const handleTabClick = (item: MenuItem) => {
    setActiveTab(item.id);
    // Close mobile menu when item is clicked
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">
            管理面板
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left",
                    isCollapsed ? "px-2" : "px-3",
                    isActive && "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                  onClick={() => handleTabClick(item)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    isCollapsed ? "mx-auto" : "mr-3",
                    isActive && "text-blue-700"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            投票系统管理后台
          </div>
        </div>
      )}
    </div>
  );
}
