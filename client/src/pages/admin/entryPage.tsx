import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { getSidebarMenus } from '@/utils/routeUtils';
import { routeConfig } from '@/router/new-routes';
import { AdminSidebarItem } from '@/router/types';
import { Outlet } from 'react-router';

export default function AdminEntryPage() {
  const sidebarItems: AdminSidebarItem[] = getSidebarMenus(routeConfig, '/admin');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={sidebarItems} />
        <AdminContentLayout>
          <Outlet />
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
