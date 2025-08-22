import { cn } from '@/lib/utils';
import { useRoutes } from '@/hooks/useRoutes';
import { AdminSidebarItem } from '@/router/types';
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

export interface AdminSidebarProps {
  items: AdminSidebarItem[];
  onItemClick?: (item: AdminSidebarItem) => void;
}

export function AdminSidebar({ items, onItemClick }: AdminSidebarProps) {
  const routes = useRoutes();

  const handleItemClick = (item: AdminSidebarItem) => {
    routes.navigate(item.id);
    onItemClick?.(item);
  };

  const isItemActive = (item: AdminSidebarItem) => {
    return routes.isCurrentRoute(item.id);
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
          <SidebarGroupLabel>默认分组</SidebarGroupLabel>
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
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.title}</span>
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
          © 2025 Made by ClackyAI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
