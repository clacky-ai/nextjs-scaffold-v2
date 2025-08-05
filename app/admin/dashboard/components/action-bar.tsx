'use client'

import { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ActionBarProps {
  // 标题和描述
  title?: string
  description?: string
  
  // 搜索功能
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  
  // 右侧操作按钮
  actions?: ReactNode
  
  // 样式定制
  className?: string
}

export function ActionBar({
  title,
  description,
  showSearch = false,
  searchPlaceholder = "搜索...",
  searchValue = "",
  onSearchChange,
  actions,
  className = ""
}: ActionBarProps) {
  // 计算存在的元素类型
  const hasTitle = title || description
  const hasSearch = showSearch
  const hasActions = actions

  // 计算存在的元素数量
  const elementCount = [hasTitle, hasSearch, hasActions].filter(Boolean).length

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-4 ${className}`}>
      {/* 当只有两类元素时，排在一行 */}
      {elementCount <= 2 && (
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：标题区域 */}
          {hasTitle && (
            <div className="flex-1">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          )}

          {/* 中间：搜索区域 */}
          {hasSearch && !hasTitle && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
          )}

          {/* 右侧：操作按钮区域 */}
          {hasActions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 当有三类元素时，分两行显示 */}
      {elementCount === 3 && (
        <>
          {/* 第一行：标题和描述 */}
          {hasTitle && (
            <div className="mb-4">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          )}

          {/* 第二行：搜索和操作按钮 */}
          <div className="flex items-center justify-between gap-4">
            {/* 左侧搜索区域 */}
            <div className="flex-1 max-w-md">
              {hasSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              )}
            </div>

            {/* 右侧操作按钮区域 */}
            {hasActions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// 预设的操作按钮组件，方便使用
export function ActionBarButton({ 
  children, 
  variant = "default", 
  size = "sm",
  ...props 
}: {
  children: ReactNode
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  [key: string]: any
}) {
  return (
    <Button variant={variant} size={size} {...props}>
      {children}
    </Button>
  )
}

// 预设的搜索组件，用于更复杂的搜索场景
export function ActionBarSearch({
  placeholder = "搜索...",
  value = "",
  onChange,
  onClear,
  className = ""
}: {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-10 pr-4 py-2"
      />
      {value && onClear && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={onClear}
        >
          ×
        </Button>
      )}
    </div>
  )
}
