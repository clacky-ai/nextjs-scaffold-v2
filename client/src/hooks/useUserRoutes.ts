import { createRouteHook } from '@/utils/router';
import { USER_ROUTES } from '@/router/user-routes';
import { ADMIN_ROUTES } from '@/router/admin-routes';

// 用户端路由Hook - 使用抽象后的工厂函数
export const useUserRoutes = createRouteHook(USER_ROUTES, ADMIN_ROUTES);
