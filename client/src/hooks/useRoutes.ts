import { useLocation } from 'wouter';
import { RouteUtils } from '@/utils/router';
import { useAdminRoutes } from './useAdminRoutes';
import { useUserRoutes } from './useUserRoutes';

// 通用路由Hook（自动检测当前是admin还是user）
// export function useRoutes() {
//   const [location] = useLocation();
//   const isAdmin = RouteUtils.isAdminRoute(location);
  
//   if (isAdmin) {
//     return { 
//       type: 'admin' as const, 
//       ...useAdminRoutes() 
//     };
//   } else {
//     return { 
//       type: 'user' as const, 
//       ...useUserRoutes() 
//     };
//   }
// }
