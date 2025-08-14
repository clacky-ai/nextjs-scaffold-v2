// 自动生成的路由配置文件
// 生成时间: 2025/8/14 14:12:17
// 请勿手动修改此文件

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

export const generatedRoutes: GeneratedRouteConfig = {
  "generatedAt": "2025-08-14T06:12:17.146Z",
  "endpoints": {}
} as const

export default generatedRoutes
