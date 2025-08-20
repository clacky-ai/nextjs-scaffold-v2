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
}, 'home');// 最后一个参数用于设置默认路由页面

// 用户端路由键类型
export type UserRouteKey = keyof typeof USER_ROUTES.routes;
