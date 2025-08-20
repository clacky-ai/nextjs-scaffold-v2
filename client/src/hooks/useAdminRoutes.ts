import { createRouteHook } from '@/utils/router';
import { ADMIN_ROUTES } from '@/router/admin-routes';
import { USER_ROUTES } from '@/router/user-routes';

// 管理端路由Hook - 使用抽象后的工厂函数
export const useAdminRoutes = createRouteHook(ADMIN_ROUTES, USER_ROUTES);
