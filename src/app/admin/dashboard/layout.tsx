'use client'

import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminSidebar } from './components/admin-sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
