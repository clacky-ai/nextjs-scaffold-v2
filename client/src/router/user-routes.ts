import { RouteConfig } from '@/utils/router';

// 用户端路由配置
export const USER_ROUTES = new RouteConfig('', {
  // 认证相关
  login: {
    path: '/login',
    title: '用户登录',
    description: '登录您的投票系统账号'
  },
  signup: {
    path: '/signup',
    title: '用户注册',
    description: '注册新的投票系统账号'
  },
  auth: {
    path: '/auth',
    title: '认证页面',
    description: '用户认证统一入口'
  },

  // 主要功能页面
  home: {
    path: '/',
    title: '首页',
    description: '用户控制台'
  },
  projects: {
    path: '/projects',
    title: '项目列表',
    description: '查看所有参赛项目'
  },
  projectNew: {
    path: '/projects/new',
    title: '新建项目',
    description: '提交新的参赛项目'
  },
  projectEdit: {
    path: '/projects/:id/edit',
    title: '编辑项目',
    description: '编辑项目信息'
  },
  projectDetail: {
    path: '/projects/:id',
    title: '项目详情',
    description: '查看项目详细信息'
  },
  myProjects: {
    path: '/my-projects',
    title: '我的项目',
    description: '管理我提交的项目'
  },
  voting: {
    path: '/voting',
    title: '投票页面',
    description: '为优秀项目投票'
  },
  myVotes: {
    path: '/my-votes',
    title: '我的投票',
    description: '查看我的投票记录'
  },
  results: {
    path: '/results',
    title: '投票结果',
    description: '查看实时统计结果'
  }
});

// 用户端路由键类型
export type UserRouteKey = keyof typeof USER_ROUTES.routes;
