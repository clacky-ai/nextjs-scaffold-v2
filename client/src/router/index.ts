import { redirect } from "react-router";
import { requireAdminAuth, requireUserAuth, RouteConfig } from "@/utils/router/routes";
import { LayoutDashboard, Users, FolderOpen, Vote, BarChart3, Settings } from 'lucide-react';

// 用户端页面
import HomePage from "@/pages/users/home";
import UserLoginPage from "@/pages/users/login";
import UserSignupPage from "@/pages/users/signup";

// 管理端页面
import AdminLoginPage from "@/pages/admin/login";
import AdminEntryPage from "@/pages/admin/entryPage";
import { UsersManagement } from "@/pages/admin/UsersManagement";
import { UserDetail } from "@/pages/admin/UserDetail";

// 公共组件
import NotFound from "@/pages/not-found";


// 统一路由配置
export const routeConfig: RouteConfig[] = [
  // 用户端路由
  {
    id: "user-login",
    path: "/login",
    element: UserLoginPage,
    meta: { title: "用户登录" },
  },
  {
    id: "user-signup",
    path: "/signup",
    element: UserSignupPage,
    meta: { title: "用户注册" },
  },

  {
    id: "home",
    path: "/",
    element: HomePage,
    // loader: requireUserAuth, // 根据用户需求判断是否需要登录后才能访问 Home
    meta: { title: "首页" },
  },
  
  // 管理员登录页面
  {
    id: "admin-login",
    path: "/admin/login",
    element: AdminLoginPage,
    meta: { title: "管理员登录" },
  },

  // 管理员受保护的路由
  {
    id: "admin",
    path: "/admin",
    element: AdminEntryPage,
    loader: requireAdminAuth,
    meta: { title: "管理后台", requiresAuth: true },
    children: [
      {
        id: "admin-index",
        index: true,
        loader: () => redirect("/admin/users"), // please modify this default page for real business
      },

      // 管理员功能页面
      {
        id: "admin-users",
        path: "users",
        element: UsersManagement,
        meta: {
          showInSidebar: true,
          sidebarOrder: 1,
          title: "用户管理",
          icon: Users,
          breadcrumbTitle: "用户管理",
        },
      },
      // 详情页面（不显示在侧边栏）
      {
        id: 'admin-user-detail',
        path: 'users/:id',
        element: UserDetail,
        meta: {
          title: '用户详情',
          breadcrumbTitle: '用户详情'
        }
      },
    ],
  },

  // 404 页面
  {
    id: "not-found",
    path: "*",
    element: NotFound,
    meta: { title: "页面未找到" },
  },
];
