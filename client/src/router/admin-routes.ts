import { RouteConfig } from '@/utils/router';

// 管理端路由配置
export const ADMIN_ROUTES = new RouteConfig('/admin', {
  // 根路径重定向（在 wouter 层面处理）
  root: {
    path: '/',
    title: '管理后台',
  },

  // 认证相关
  login: {
    path: '/login',
    title: '管理员登录',
    description: '登录投票系统管理后台'
  },

  // 主要功能页面（显示在侧边栏）
  dashboard: {
    path: '/dashboard',  // 空字符串表示根路径，将生成 /admin
    title: '仪表盘',
    description: '系统概览和关键指标'
  },
  users: {
    path: '/users',
    title: '用户管理',
    description: '管理系统用户和权限'
  },
  // 详情页面（不显示在侧边栏）
  userDetail: {
    path: '/users/:id',
    title: '用户详情',
    description: '查看用户详细信息',
    // breadcrumb: {
    //   parent: 'users',  // 指定父路由为用户管理
    // }
  },
  userEdit: {
    path: '/users/:id/edit',
    title: '编辑用户',
    description: '编辑用户信息',
  },

  // 其他功能页面（不显示在侧边栏）
  profile: {
    path: '/profile',
    title: '个人资料',
    description: '管理个人账户信息'
  },
}, 'dashboard'); // 最后一个参数用于设置默认路由页面

// 管理端路由键类型
export type AdminRouteKey = keyof typeof ADMIN_ROUTES.routes;
