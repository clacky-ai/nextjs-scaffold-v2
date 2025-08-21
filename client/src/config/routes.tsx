// React Router v7 统一路由配置 - 只处理路由映射，不处理业务逻辑
import React from "react";
import { redirect } from "react-router";

// 导入页面组件
// 用户端页面
import HomePage from "@/pages/users/HomePage";
import ProjectsPage from '@/pages/users/projects';
import VotingPage from '@/pages/users/voting';
import ResultsPage from '@/pages/users/results';
import MyVotesPage from '@/pages/users/my-votes';
import MyProjectsPage from '@/pages/users/my-projects';
import ProjectFormPage from '@/pages/users/project-form';
import UserLoginPage from "@/pages/users/LoginPage";
import UserSignupPage from "@/pages/users/SignupPage";

import useUserAuthStore from "@/stores/users/authStore";
import useAdminAuthStore from "@/stores/admin/authStore";

// 路由配置接口
export interface RouteConfig {
  id: string;
  path?: string;
  index?: boolean;
  element?: React.ComponentType<any>;
  loader?: (args: any) => Promise<any> | any;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    icon?: string;
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