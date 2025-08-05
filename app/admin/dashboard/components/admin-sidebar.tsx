'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users,
  FolderOpen,
  Vote,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  session: {
    user: {
      id: string
      username: string
      name: string
      email: string
    }
  }
  systemStatus?: {
    isVotingEnabled: boolean
    maxVotesPerUser: number
  } | null
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  {
    id: 'overview',
    label: '概览',
    icon: BarChart3,
    description: '系统统计和概览'
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    description: '管理所有注册用户'
  },
  {
    id: 'projects',
    label: '项目管理',
    icon: FolderOpen,
    description: '管理所有提交的项目'
  },
  {
    id: 'votes',
    label: '投票管理',
    icon: Vote,
    description: '查看和管理投票记录'
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: Settings,
    description: '管理系统全局设置'
  }
]

export function AdminSidebar({
  session,
  systemStatus,
  activeTab,
  onTabChange
}: AdminSidebarProps) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSignOut = async () => {
    // 删除管理员token
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    // 重定向到管理员登录页
    router.push('/admin/sign-in')
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // 移动端侧边栏
  if (isMobile) {
    return (
      <>
        {/* 移动端菜单按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 移动端遮罩 */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMobile}
          />
        )}

        {/* 移动端侧边栏 */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <MobileSidebarContent
            session={session}
            systemStatus={systemStatus}
            activeTab={activeTab}
            onTabChange={(tab) => {
              onTabChange(tab)
              setIsMobileOpen(false)
            }}
            onClose={toggleMobile}
            handleSignOut={handleSignOut}
          />
        </div>
      </>
    )
  }

  // 桌面端侧边栏
  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 transition-opacity duration-200">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 transition-colors",
            isCollapsed && "absolute right-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-gray-200 transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {!isCollapsed ? (
          <div className="transition-opacity duration-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {session.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            {systemStatus && (
              <div className="mt-3">
                <Badge
                  variant={systemStatus.isVotingEnabled ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {systemStatus.isVotingEnabled ? '投票开启' : '投票暂停'}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {session.user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200 group",
                isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2",
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn(
                "flex-shrink-0 transition-transform group-hover:scale-110",
                isCollapsed ? "h-5 w-5" : "h-4 w-4"
              )} />
              {!isCollapsed && (
                <span className="ml-3 truncate transition-opacity duration-200">
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group",
            isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2 justify-start"
          )}
          title={isCollapsed ? "退出登录" : undefined}
        >
          <LogOut className={cn(
            "flex-shrink-0 transition-transform group-hover:scale-110",
            isCollapsed ? "h-5 w-5" : "h-4 w-4"
          )} />
          {!isCollapsed && (
            <span className="ml-3 transition-opacity duration-200">退出登录</span>
          )}
        </Button>
      </div>
    </div>
  )
}

// 移动端侧边栏内容组件
function MobileSidebarContent({
  session,
  systemStatus,
  activeTab,
  onTabChange,
  onClose,
  handleSignOut
}: {
  session: AdminSidebarProps['session']
  systemStatus: AdminSidebarProps['systemStatus']
  activeTab: string
  onTabChange: (tab: string) => void
  onClose: () => void
  handleSignOut: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* 移动端头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 移动端用户信息 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {session.user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user?.email}
            </p>
          </div>
        </div>
        {systemStatus && (
          <div className="mt-3">
            <Badge
              variant={systemStatus.isVotingEnabled ? 'default' : 'secondary'}
              className="text-xs"
            >
              {systemStatus.isVotingEnabled ? '投票开启' : '投票暂停'}
            </Badge>
          </div>
        )}
      </div>

      {/* 移动端导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* 移动端底部 */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-3"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="ml-3">退出登录</span>
        </Button>
      </div>
    </div>
  )
}
