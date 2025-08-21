import { redirect } from "react-router";
import { requireAdminAuth, requireUserAuth, RouteConfig } from "@/config/routes";

// 导入页面组件
// 用户端页面
import HomePage from "@/pages/users/HomePage";
import ProjectsPage from '@/pages/users/projects';
import VotingPage from '@/pages/users/voting';
import ResultsPage from '@/pages/users/results';
import MyVotesPage from '@/pages/users/my-votes';
import MyProjectsPage from '@/pages/users/my-projects';
// import ProjectFormPage from '@/pages/users/project-form';
import UserLoginPage from "@/pages/users/login";
import UserSignupPage from "@/pages/users/SignupPage";

// 管理端页面
import AdminLoginPage from "@/pages/admin/login";
import AdminEntryPage from "@/pages/admin/entryPage";
import { Dashboard } from "@/components/admin/pages/Dashboard";
import { UsersManagement } from "@/components/admin/pages/UsersManagement";
import { UserDetail } from "@/components/admin/pages/UserDetail";
import { ProjectsManagement } from "@/components/admin/pages/ProjectsManagement";
import { VotesManagement } from "@/components/admin/pages/VotesManagement";
import { ResultsStatistics } from "@/components/admin/pages/ResultsStatistics";
import { SystemSettings } from "@/components/admin/pages/SystemSettings";

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

  // 用户认证后的路由
  {
    id: "home",
    path: "/",
    element: HomePage,
    loader: requireUserAuth,
    meta: { title: "首页", requiresAuth: true },
  },
  {
    id: 'projects',
    path: '/projects',
    element: ProjectsPage,
    loader: requireUserAuth,
    meta: { title: '项目列表', requiresAuth: true }
  },
//   {
//     id: 'project-new',
//     path: '/projects/new',
//     element: ProjectFormPage,
//     loader: requireUserAuth,
//     meta: { title: '新建项目', requiresAuth: true }
//   },
//   {
//     id: 'project-edit',
//     path: '/projects/:id/edit',
//     element: ProjectFormPage,
//     loader: requireUserAuth,
//     meta: { title: '编辑项目', requiresAuth: true }
//   },
  {
    id: 'project-detail',
    path: '/projects/:id',
    element: ProjectsPage,
    loader: requireUserAuth,
    meta: { title: '项目详情', requiresAuth: true }
  },
  {
    id: 'my-projects',
    path: '/my-projects',
    element: MyProjectsPage,
    loader: requireUserAuth,
    meta: { title: '我的项目', requiresAuth: true }
  },
  {
    id: 'voting',
    path: '/voting',
    element: VotingPage,
    loader: requireUserAuth,
    meta: { title: '投票页面', requiresAuth: true }
  },
  {
    id: 'my-votes',
    path: '/my-votes',
    element: MyVotesPage,
    loader: requireUserAuth,
    meta: { title: '我的投票', requiresAuth: true }
  },
  {
    id: 'results',
    path: '/results',
    element: ResultsPage,
    loader: requireUserAuth,
    meta: { title: '投票结果', requiresAuth: true }
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
        loader: () => redirect("/admin/dashboard"),
      },

      // 管理员功能页面
      {
        id: "admin-dashboard",
        path: "dashboard",
        element: Dashboard,
        meta: {
          title: "仪表盘",
          icon: "LayoutDashboard",
          breadcrumbTitle: "仪表盘",
        },
      },
      {
        id: "admin-users",
        path: "users",
        element: UsersManagement,
        meta: {
          title: "用户管理",
          icon: "Users",
          breadcrumbTitle: "用户管理",
        },
      },
      {
        id: 'admin-projects',
        path: 'projects',
        element: ProjectsManagement,
        meta: {
          title: '项目管理',
          icon: 'FolderOpen',
          breadcrumbTitle: '项目管理'
        }
      },
      {
        id: 'admin-votes',
        path: 'votes',
        element: VotesManagement,
        meta: {
          title: '投票管理',
          icon: 'Vote',
          breadcrumbTitle: '投票管理'
        }
      },
      {
        id: 'admin-results',
        path: 'results',
        element: ResultsStatistics,
        meta: {
          title: '结果统计',
          icon: 'BarChart3',
          breadcrumbTitle: '结果统计'
        }
      },
      {
        id: 'admin-settings',
        path: 'settings',
        element: SystemSettings,
        meta: {
          title: '系统设置',
          icon: 'Settings',
          breadcrumbTitle: '系统设置'
        }
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
