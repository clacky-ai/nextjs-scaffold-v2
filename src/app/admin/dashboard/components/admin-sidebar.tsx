'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  systemStatus?: {
    isVotingEnabled: boolean
    maxVotesPerUser: number
  } | null
}

const menuItems = [
  {
    id: 'overview',
    path: '/admin/dashboard/overview',
    label: '概览',
    icon: BarChart3,
    description: '系统统计和概览'
  },
  {
    id: 'users',
    path: '/admin/dashboard/users',
    label: '用户管理',
    icon: Users,
    description: '管理所有注册用户'
  },
  {
    id: 'projects',
    path: '/admin/dashboard/projects',
    label: '项目管理',
    icon: FolderOpen,
    description: '管理所有提交的项目'
  },
  {
    id: 'votes',
    path: '/admin/dashboard/votes',
    label: '投票管理',
    icon: Vote,
    description: '查看和管理投票记录'
  },
  {
    id: 'settings',
    path: '/admin/dashboard/settings',
    label: '管理员设置',
    icon: Settings,
    description: '管理管理员账号和个人设置'
  }
]

export function AdminSidebar({
  systemStatus
}: AdminSidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const activeTab = menuItems.find(item => pathname === item.path)?.id || 'overview'

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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/sign-in' })
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
            systemStatus={systemStatus}
            activeTab={activeTab}
            onTabChange={(tab) => {
              const menuItem = menuItems.find(item => item.id === tab)
              if (menuItem) {
                router.push(menuItem.path)
              }
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
      {/* Header - 管理员信息区域 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 flex-1 min-w-0 transition-opacity duration-200">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">
                {session?.user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0 group relative">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
              {/* Hover 时显示完整信息的 tooltip */}
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 whitespace-nowrap shadow-lg">
                <div>{session?.user?.name}</div>
                <div className="text-gray-300">{session?.user?.email}</div>
                {/* 小箭头 */}
                <div className="absolute bottom-full left-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>
        ) : (
          /* 折叠状态：只显示展开按钮，居中显示 */
          <div className="flex items-center justify-center w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors group relative"
              title="展开侧边栏"
            >
              <ChevronRight className="h-4 w-4" />
              {/* 折叠状态下的 hover 提示 */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 whitespace-nowrap shadow-lg">
                <div>{session?.user?.name}</div>
                <div className="text-gray-300">{session?.user?.email}</div>
                {/* 小箭头 */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
              </div>
            </Button>
          </div>
        )}

        {/* 展开状态的折叠按钮 */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors flex-shrink-0 ml-3"
            title="折叠侧边栏"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className={cn(
          "border-b border-gray-200 transition-all duration-300",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {!isCollapsed ? (
            <div className="transition-opacity duration-200">
              <Badge
                variant={systemStatus.isVotingEnabled ? 'default' : 'secondary'}
                className="text-xs"
              >
                {systemStatus.isVotingEnabled ? '投票开启' : '投票暂停'}
              </Badge>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={cn(
                "w-2 h-2 rounded-full",
                systemStatus.isVotingEnabled ? "bg-green-500" : "bg-gray-400"
              )} title={systemStatus.isVotingEnabled ? '投票开启' : '投票暂停'} />
            </div>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
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
  systemStatus,
  activeTab,
  onTabChange,
  onClose,
  handleSignOut
}: {
  systemStatus: AdminSidebarProps['systemStatus']
  activeTab: string
  onTabChange: (tab: string) => void
  onClose: () => void
  handleSignOut: () => void
}) {
  const { data: session } = useSession()
  return (
    <div className="flex flex-col h-full">
      {/* 移动端头部 - 管理员信息区域 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-blue-600">
              {session?.user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 flex-shrink-0 ml-3"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 移动端系统状态 */}
      {systemStatus && (
        <div className="p-4 border-b border-gray-200">
          <Badge
            variant={systemStatus.isVotingEnabled ? 'default' : 'secondary'}
            className="text-xs"
          >
            {systemStatus.isVotingEnabled ? '投票开启' : '投票暂停'}
          </Badge>
        </div>
      )}

      {/* 移动端导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                const menuItem = menuItems.find(i => i.id === item.id)
                if (menuItem) {
                  router.push(menuItem.path)
                }
              }}
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
