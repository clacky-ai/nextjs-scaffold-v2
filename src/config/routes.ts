export interface RouteConfig {
  endpoint: string
  publicPaths: string[]
  protectedPaths: string[]
  apiPaths: string[]
  authApiPaths: string[]
}

export interface EndpointRouteMap {
  [endpoint: string]: RouteConfig
}

export interface GeneratedRouteConfig {
  generatedAt: string
  endpoints: EndpointRouteMap
}

/**
 * 读取生成的路由配置
 */
export function loadGeneratedRoutes(): GeneratedRouteConfig | null {
  try {
    // 在构建时和运行时都能正确读取
    const configPath = require.resolve('./generated-routes.json')
    const config = require(configPath)
    return config as GeneratedRouteConfig
  } catch (error) {
    console.warn('无法加载生成的路由配置:', error.message)
    return null
  }
}

/**
 * 获取端点的所有公开路径
 */
export function getPublicPaths(endpoint: string): string[] {
  const config = loadGeneratedRoutes()
  return config?.endpoints[endpoint]?.publicPaths || []
}

/**
 * 获取端点的所有保护路径
 */
export function getProtectedPaths(endpoint: string): string[] {
  const config = loadGeneratedRoutes()
  return config?.endpoints[endpoint]?.protectedPaths || []
}

/**
 * 获取端点的所有 API 路径
 */
export function getApiPaths(endpoint: string): string[] {
  const config = loadGeneratedRoutes()
  return config?.endpoints[endpoint]?.apiPaths || []
}

/**
 * 获取端点的认证 API 路径
 */
export function getAuthApiPaths(endpoint: string): string[] {
  const config = loadGeneratedRoutes()
  return config?.endpoints[endpoint]?.authApiPaths || []
}

/**
 * 检查路径是否为指定端点的公开路径
 */
export function isPublicPath(endpoint: string, pathname: string): boolean {
  const publicPaths = getPublicPaths(endpoint)
  return publicPaths.some(path => {
    // 支持动态路由匹配
    const regexPath = path.replace(/\\[.*?\\]/g, '[^/]+')
    const regex = new RegExp(`^${regexPath}$`)
    return regex.test(pathname)
  })
}

/**
 * 检查路径是否为指定端点的保护路径
 */
export function isProtectedPath(endpoint: string, pathname: string): boolean {
  const protectedPaths = getProtectedPaths(endpoint)
  return protectedPaths.some(path => {
    const regexPath = path.replace(/\\[.*?\\]/g, '[^/]+')
    const regex = new RegExp(`^${regexPath}$`)
    return regex.test(pathname)
  })
}