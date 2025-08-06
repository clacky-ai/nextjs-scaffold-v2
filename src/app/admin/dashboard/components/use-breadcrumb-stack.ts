'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

export interface BreadcrumbInfo {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
}

export interface BreadcrumbStackItem {
  path: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  timestamp: number
}

/**
 * 面包屑堆栈管理Hook
 * 基于提供的面包屑信息进行简单的压栈操作
 */
export function useBreadcrumbStack(currentBreadcrumb?: BreadcrumbInfo) {
  const pathname = usePathname()
  const router = useRouter()
  const [stack, setStack] = useState<BreadcrumbStackItem[]>([])
  
  // 使用 useMemo 来稳定 breadcrumb 对象，避免无限重新渲染
  const stableBreadcrumb = useMemo(() => {
    if (!currentBreadcrumb) return null
    return {
      label: currentBreadcrumb.label,
      icon: currentBreadcrumb.icon,
      href: currentBreadcrumb.href || pathname
    }
  }, [currentBreadcrumb?.label, currentBreadcrumb?.icon, currentBreadcrumb?.href, pathname])
  
  // 更新堆栈
  useEffect(() => {
    if (!pathname.startsWith('/admin/dashboard')) {
      setStack([])
      return
    }
    
    if (!stableBreadcrumb) {
      return
    }

    const currentHref = stableBreadcrumb.href
    
    setStack(currentStack => {
      // 首先添加根面包屑（管理后台）
      const rootBreadcrumb: BreadcrumbStackItem = {
        path: '/admin/dashboard',
        label: '管理后台',
        icon: Home,
        timestamp: Date.now()
      }
      
      // 如果当前就是根路径，只返回根面包屑
      if (currentHref === '/admin/dashboard') {
        return [rootBreadcrumb]
      }
      
      // 检查当前面包屑是否已经在栈中
      const existingIndex = currentStack.findIndex(item => item.path === currentHref)
      
      if (existingIndex >= 0) {
        // 如果存在，保留到该位置的所有面包屑，更新当前面包屑信息
        const updatedStack = currentStack.slice(0, existingIndex + 1)
        updatedStack[existingIndex] = {
          path: currentHref,
          label: stableBreadcrumb.label,
          icon: stableBreadcrumb.icon,
          timestamp: Date.now()
        }
        return updatedStack
      } else {
        // 如果不存在，检查是否是现有路径的子路径
        let parentStack: BreadcrumbStackItem[] = [rootBreadcrumb]
        
        // 寻找最长的父路径匹配
        for (let i = currentStack.length - 1; i >= 0; i--) {
          const stackItem = currentStack[i]
          if (currentHref.startsWith(stackItem.path + '/') || currentHref === stackItem.path) {
            parentStack = currentStack.slice(0, i + 1)
            break
          }
        }
        
        // 添加当前面包屑到栈中
        const newItem: BreadcrumbStackItem = {
          path: currentHref,
          label: stableBreadcrumb.label,
          icon: stableBreadcrumb.icon,
          timestamp: Date.now()
        }
        
        return [...parentStack, newItem]
      }
    })
  }, [pathname, stableBreadcrumb])
  
  // 处理面包屑点击
  const handleBreadcrumbClick = useCallback((targetPath: string) => {
    if (targetPath !== pathname) {
      router.push(targetPath)
    }
  }, [pathname, router])
  
  // 转换为展示格式
  const displayItems = stack.map((item, index) => ({
    label: item.label,
    icon: item.icon,
    path: item.path,
    isActive: item.path === pathname,
    onClick: () => handleBreadcrumbClick(item.path)
  }))
  
  return {
    breadcrumbItems: displayItems,
    stack,
    currentPath: pathname
  }
}