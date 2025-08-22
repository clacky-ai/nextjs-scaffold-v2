import React from "react";
import { redirect } from "react-router";
import { LucideIcon } from "lucide-react";
import useUserAuthStore from "@/stores/users/authStore";
import useAdminAuthStore from "@/stores/admin/authStore";

// 路由配置接口
export interface RouteConfig {
  id: string;
  path?: string;
  index?: boolean;
  element?: React.ComponentType<any>;
  loader?: (args: any) => Promise<any> | any;
  action?: (args: any) => Promise<any> | any;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    icon?: LucideIcon;
    requiresAuth?: boolean;
    showInSidebar?: boolean;
    sidebarOrder?: number;
    breadcrumbTitle?: string;
    redirectTo?: string;
  };
}

export async function requireUserAuth() {
  const state = useUserAuthStore.getState();
  if (!state.isAuthenticated) {
    throw redirect("/login");
  }
  return null;
}

export async function requireAdminAuth() {
  const state = useAdminAuthStore.getState();
  if (!state.isAuthenticated) {
    throw redirect("/admin/login");
  }
  return null;
}