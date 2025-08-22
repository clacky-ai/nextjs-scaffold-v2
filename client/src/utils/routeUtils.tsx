// React Router v7 路由工具函数
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router';
import type { RouteConfig } from '@/utils/router/routes';
import type { AdminSidebarItem } from '@/types/admin';

// 将配置转换为 React Router v7 的路由对象
export function convertConfigToRoutes(routes: RouteConfig[]): RouteObject[] {
  return routes.map(route => {
    const routeObject: RouteObject = {
      id: route.id,
      path: route.path,
      index: route.index,
      element: route.element ? React.createElement(route.element) : undefined,
      loader: route.loader,
      action: route.action
    };

    if (route.children && route.children.length > 0) {
      routeObject.children = convertConfigToRoutes(route.children);
    }

    return routeObject;
  });
}

// 创建路由器
export function createAppRouter(routes: RouteConfig[]) {
  const routeObjects = convertConfigToRoutes(routes);
  return createBrowserRouter(routeObjects);
}

// 获取侧边栏菜单
export function getSidebarMenus(routes: RouteConfig[], basePath = ''): AdminSidebarItem[] {
  const menus: AdminSidebarItem[] = [];
  
  function extractMenus(routeList: RouteConfig[], currentPath = '') {
    routeList.forEach(route => {
      if (route.meta?.showInSidebar && route.path) {
        const fullPath = currentPath + '/' + route.path;
        menus.push({
          id: route.id,
          path: fullPath.replace('//', '/'),
          title: route.meta.title || '',
          icon: route.meta.icon,
          order: route.meta.sidebarOrder ?? 999
        });
      }
      
      if (route.children) {
        const childPath = route.path ? currentPath + '/' + route.path : currentPath;
        extractMenus(route.children, childPath);
      }
    });
  }
  
  extractMenus(routes, basePath);
  return menus.sort((a, b) => a.order - b.order);
}

// 获取面包屑导航
export function getBreadcrumbs(routes: RouteConfig[], currentPath: string): Array<{
  id: string;
  path: string;
  title: string;
}> {
  const breadcrumbs: Array<{ id: string; path: string; title: string }> = [];
  
  function findRoute(routeList: RouteConfig[], path: string, parentPath = ''): RouteConfig | null {
    for (const route of routeList) {
      if (!route.path && !route.index) continue;
      
      const fullPath = route.index ? parentPath : parentPath + '/' + route.path;
      const normalizedPath = fullPath.replace('//', '/');
      
      // 匹配当前路径或参数化路径
      if (normalizedPath === path || matchParameterizedPath(normalizedPath, path)) {
        return route;
      }
      
      if (route.children) {
        const found = findRoute(route.children, path, normalizedPath);
        if (found) {
          // 添加父级面包屑
          if (route.meta?.breadcrumbTitle || route.meta?.title) {
            breadcrumbs.unshift({
              id: route.id,
              path: normalizedPath,
              title: route.meta.breadcrumbTitle || route.meta.title || ''
            });
          }
          return found;
        }
      }
    }
    return null;
  }
  
  const foundRoute = findRoute(routes, currentPath);
  if (foundRoute?.meta?.breadcrumbTitle || foundRoute?.meta?.title) {
    breadcrumbs.push({
      id: foundRoute.id,
      path: currentPath,
      title: foundRoute.meta.breadcrumbTitle || foundRoute.meta.title || ''
    });
  }
  
  return breadcrumbs;
}

// 简单的参数化路径匹配
function matchParameterizedPath(routePath: string, actualPath: string): boolean {
  const routeParts = routePath.split('/');
  const actualParts = actualPath.split('/');
  
  if (routeParts.length !== actualParts.length) {
    return false;
  }
  
  return routeParts.every((part, index) => {
    return part.startsWith(':') || part === actualParts[index];
  });
}

// 根据路由 ID 获取路径
export function getRoutePathById(routes: RouteConfig[], routeId: string): string | null {
  function searchRoute(routeList: RouteConfig[], parentPath = ''): string | null {
    for (const route of routeList) {
      if (route.id === routeId) {
        if (route.index) {
          return parentPath || '/';
        }
        return parentPath + '/' + route.path;
      }
      
      if (route.children) {
        const childPath = route.path ? parentPath + '/' + route.path : parentPath;
        const found = searchRoute(route.children, childPath);
        if (found) return found;
      }
    }
    return null;
  }
  
  return searchRoute(routes);
}

// 检查当前路径是否匹配某个路由
export function isRouteActive(routes: RouteConfig[], routeId: string, currentPath: string): boolean {
  const routePath = getRoutePathById(routes, routeId);
  if (!routePath) return false;
  
  return currentPath === routePath || matchParameterizedPath(routePath, currentPath);
}
