import { RouteConfig } from '@/utils/router';

// 管理端路由配置
export const ADMIN_ROUTES = new RouteConfig('/admin', {
  // 认证相关
  login: {
    path: '/login',
    title: '管理员登录',
    description: '登录投票系统管理后台'
  },

  // 主要功能页面（显示在侧边栏）
  dashboard: {
    path: '',  // 空字符串表示根路径，将生成 /admin
    title: '仪表盘',
    description: '系统概览和关键指标'
  },
  users: {
    path: '/users',
    title: '用户管理',
    description: '管理系统用户和权限'
  },
  projects: {
    path: '/projects',
    title: '项目管理',
    description: '管理参赛项目和审核'
  },
  votes: {
    path: '/votes',
    title: '投票管理',
    description: '管理投票流程和规则'
  },
  results: {
    path: '/results',
    title: '结果统计',
    description: '查看投票结果和数据分析'
  },
  settings: {
    path: '/settings',
    title: '系统设置',
    description: '配置系统参数和选项'
  },

  // 详情页面（不显示在侧边栏）
  userDetail: {
    path: '/users/:id',
    title: '用户详情',
    description: '查看用户详细信息'
  },
  userEdit: {
    path: '/users/:id/edit',
    title: '编辑用户',
    description: '编辑用户信息'
  },
  projectDetail: {
    path: '/projects/:id',
    title: '项目详情',
    description: '查看项目详细信息'
  },
  projectEdit: {
    path: '/projects/:id/edit',
    title: '编辑项目',
    description: '编辑项目信息'
  },
  voteDetail: {
    path: '/votes/:id',
    title: '投票详情',
    description: '查看投票详细信息'
  },

  // 其他功能页面（不显示在侧边栏）
  profile: {
    path: '/profile',
    title: '个人资料',
    description: '管理个人账户信息'
  },
  notifications: {
    path: '/notifications',
    title: '通知中心',
    description: '查看系统通知'
  }
}, 'dashboard'); // 最后一个参数用于设置默认路由页面

// 管理端路由键类型
export type AdminRouteKey = keyof typeof ADMIN_ROUTES.routes;
