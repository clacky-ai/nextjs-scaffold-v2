import { redirect } from "react-router";
import { requireAdminAuth, requireUserAuth, RouteConfig } from "@/utils/router/routes";
import { Users } from 'lucide-react';

// 整个产品的入口页面
import LandingPage from "@/pages/LandingPage";

// 用户端页面
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
  // 整个产品的入口页面，请根据需求重构这个页面
  {
    id: "landing",
    path: "/",
    element: LandingPage,
    // loader: requireUserAuth, // 根据用户需求判断是否需要登录后才能访问
    meta: { title: "首页" },
  },

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

  // 用户登录后的首页，请根据需求重构 path
  // {
  //   id: "user-home",
  //   path: "/home",
  //   element: UserHomePage,
  //   loader: requireUserAuth, 
  //   meta: { title: "用户首页" },
  // },
  
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
