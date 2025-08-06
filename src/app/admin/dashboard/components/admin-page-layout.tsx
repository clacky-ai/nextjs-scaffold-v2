'use client'

import { ReactNode, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreadcrumbStack, BreadcrumbInfo } from './use-breadcrumb-stack'

interface AdminPageLayoutProps {
  children: ReactNode
  breadcrumb?: BreadcrumbInfo
}

export function AdminPageLayout({ children, breadcrumb }: AdminPageLayoutProps) {
  const pathname = usePathname()
  
  // 使用 useMemo 稳定 breadcrumb 对象，避免无限重新渲染
  const enrichedBreadcrumb = useMemo<BreadcrumbInfo | undefined>(() => {
    if (!breadcrumb) return undefined
    
    return {
      label: breadcrumb.label,
      icon: breadcrumb.icon,
      href: breadcrumb.href || pathname
    }
  }, [breadcrumb?.label, breadcrumb?.icon, breadcrumb?.href, pathname])
  
  const { breadcrumbItems } = useBreadcrumbStack(enrichedBreadcrumb)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 简化的页面头部 - 只包含面包屑 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        {/* 动态面包屑导航 */}
        {breadcrumbItems.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                <div className="flex items-center space-x-1">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {!item.isActive ? (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-gray-500 hover:text-gray-700"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </nav>
        )}
      </header>

      {/* 页面内容 */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
