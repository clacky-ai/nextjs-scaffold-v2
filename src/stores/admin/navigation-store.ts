import { create } from 'zustand'
import { MenuItem } from './types'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}

interface NavigationStore {
  // State
  activeTab: string
  menuItems: MenuItem[]
  breadcrumbs: BreadcrumbItem[]
  isCollapsed: boolean
  isMobileOpen: boolean
  
  // Actions
  setActiveTab: (tabId: string) => void
  setMenuItems: (items: MenuItem[]) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setCollapsed: (collapsed: boolean) => void
  setMobileOpen: (open: boolean) => void
  
  // Navigation
  navigateToTab: (tabId: string) => string | undefined
  getActiveMenuItem: () => MenuItem | undefined
  
  // Path utilities
  setActiveTabByPath: (pathname: string) => void
  generateBreadcrumbs: (pathname: string) => void
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  activeTab: 'overview',
  menuItems: [],
  breadcrumbs: [],
  isCollapsed: false,
  isMobileOpen: false,
  
  // Basic actions
  setActiveTab: (activeTab) => set({ activeTab }),
  setMenuItems: (menuItems) => set({ menuItems }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  
  // Navigation
  navigateToTab: (tabId) => {
    const { menuItems } = get()
    const menuItem = menuItems.find(item => item.id === tabId)
    
    if (menuItem) {
      set({ activeTab: tabId })
      return menuItem.path
    }
    
    return undefined
  },
  
  getActiveMenuItem: () => {
    const { activeTab, menuItems } = get()
    return menuItems.find(item => item.id === activeTab)
  },
  
  // Path utilities
  setActiveTabByPath: (pathname) => {
    const { menuItems } = get()
    
    // First try exact match
    const exactMatch = menuItems.find(item => pathname === item.path)
    if (exactMatch) {
      set({ activeTab: exactMatch.id })
      return
    }
    
    // If no exact match, try path prefix match
    const pathMatch = menuItems.find(item => {
      // Make sure it's not root path match, and current path starts with menu item path
      return item.path !== '/admin/dashboard' && pathname.startsWith(item.path + '/')
    })
    
    if (pathMatch) {
      set({ activeTab: pathMatch.id })
    } else {
      // Default to overview if no match
      set({ activeTab: 'overview' })
    }
  },
  
  generateBreadcrumbs: (pathname) => {
    const { menuItems } = get()
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always start with dashboard
    breadcrumbs.push({
      label: '管理面板',
      href: '/admin/dashboard',
    })
    
    // Find current menu item
    let currentItem = menuItems.find(item => pathname === item.path)
    if (!currentItem) {
      // Try path prefix match for sub-routes
      currentItem = menuItems.find(item => 
        item.path !== '/admin/dashboard' && pathname.startsWith(item.path + '/')
      )
    }
    
    if (currentItem && currentItem.path !== '/admin/dashboard') {
      breadcrumbs.push({
        label: currentItem.label,
        href: currentItem.path,
        icon: currentItem.icon
      })
      
      // Handle sub-routes (like user detail pages)
      if (pathname !== currentItem.path) {
        const subPath = pathname.replace(currentItem.path, '')
        if (subPath.includes('/')) {
          const parts = subPath.split('/').filter(Boolean)
          if (parts.length > 0) {
            // For now, just add generic sub-page label
            // This can be enhanced based on specific route patterns
            breadcrumbs.push({
              label: '详情',
              href: pathname
            })
          }
        }
      }
    }
    
    set({ breadcrumbs })
  }
}))