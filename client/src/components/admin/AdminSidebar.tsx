import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/router/admin-routes';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

export interface AdminSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
}

export interface AdminSidebarProps {
  items: AdminSidebarItem[];
  onItemClick?: (item: AdminSidebarItem) => void;
}

export function AdminSidebar({ items, onItemClick }: AdminSidebarProps) {
  const [location, navigate] = useLocation();

  const handleItemClick = (item: AdminSidebarItem) => {
    navigate(item.path);
    onItemClick?.(item);
  };

  const isItemActive = (item: AdminSidebarItem) => {
    // 精确匹配当前路径
    if (location === item.path) return true;
    
    // 如果是默认路由（首页），只有在完全匹配时才激活
    const defaultPath = ADMIN_ROUTES.getDefaultPath();
    if (item.path === defaultPath) {
      return location === defaultPath;
    }
    
    // 其他路径使用前缀匹配
    return location.startsWith(item.path);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 h-12">
        <div className="flex items-center justify-start space-x-3 w-full">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <h2 className="text-lg font-semibold">投票系统</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理功能</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isItemActive(item);
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          © 2024 投票系统
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
