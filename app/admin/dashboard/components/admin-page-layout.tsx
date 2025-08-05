'use client'

import { ReactNode } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface AdminPageLayoutProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageLayout({
  title,
  description,
  breadcrumbs = [],
  actions,
  children
}: AdminPageLayoutProps) {
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: '管理后台', href: '/admin/dashboard', icon: Home },
    ...breadcrumbs
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 页面头部 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        {/* 面包屑导航 */}
        {defaultBreadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            {defaultBreadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                <div className="flex items-center space-x-1">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.href ? (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        // 这里可以添加路由跳转逻辑
                        console.log('Navigate to:', item.href)
                      }}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <span className={index === defaultBreadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </nav>
        )}

        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* 页面内容 */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
