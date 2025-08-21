import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { ADMIN_SIDEBAR_ITEMS } from '@/router/admin-sidebar';
import { Outlet } from 'react-router';

export default function AdminEntryPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={ADMIN_SIDEBAR_ITEMS} />
        <AdminContentLayout>
          <Outlet />
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
