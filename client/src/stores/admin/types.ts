export interface User {
  id: string
  name: string
  email: string
  phone?: string
  team?: string
  isBlocked: boolean
  createdAt: string
}

export interface UserStats {
  total: number
  active: number
  blocked: number
}

export interface LoadingState {
  [key: string]: boolean
}
export interface MenuItem {
  id: string
  label: string
  path: string
  icon: any
  description?: string
}
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}
