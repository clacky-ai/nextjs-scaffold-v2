import { NextRequest, NextResponse } from 'next/server'
import { loadGeneratedRoutes, isPublicPath, isProtectedPath } from './config/routes'

// 端点配置接口
interface EndpointConfig {
  name: string
  pathPrefix: string
  apiPrefix: string
  cookieName: string
  loginPath: string
  hasSecureCookie: boolean
}

// 根据生成的路由配置动态获取端点配置
function getEndpointConfigs(): EndpointConfig[] {
  const routeConfig = loadGeneratedRoutes()
  if (!routeConfig) {
    console.warn('无法加载路由配置，使用默认配置')
    return []
  }

  const configs: EndpointConfig[] = []
  
  for (const [endpointName, config] of Object.entries(routeConfig.endpoints)) {
    // 判断是否使用路由组
    const useRouteGroup = endpointName.startsWith('(') && endpointName.endsWith(')')
    const cleanEndpointName = useRouteGroup ? endpointName.slice(1, -1) : endpointName
    
    configs.push({
      name: cleanEndpointName,
      pathPrefix: useRouteGroup ? '/' : `/${endpointName}`,
      apiPrefix: `/api/${cleanEndpointName}`,
      cookieName: `${cleanEndpointName}-session-token`,
      loginPath: useRouteGroup ? '/sign-in' : `/${endpointName}/sign-in`,
      hasSecureCookie: true // 可以根据需要配置
    })
  }
  
  return configs
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  console.log(`🔍 Middleware: ${pathname}`)

  // API路由在各自处理函数中认证
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 动态获取端点配置
  const endpointConfigs = getEndpointConfigs()
  
  // 遍历所有端点配置进行匹配
  for (const config of endpointConfigs) {
    if (pathname.startsWith(config.pathPrefix) || config.pathPrefix === '/') {
      return handleEndpointAuth(req, config, pathname)
    }
  }

  // 没有匹配到任何端点，继续处理
  return NextResponse.next()
}

/**
 * 处理端点认证逻辑
 */
function handleEndpointAuth(
  req: NextRequest, 
  config: EndpointConfig, 
  pathname: string
): NextResponse {
  const sessionToken = req.cookies.get(config.cookieName)?.value
  const isLoggedIn = !!sessionToken

  console.log(`🔐 检查端点 [${config.name}] 认证状态:`, {
    pathname,
    isLoggedIn,
    cookieName: config.cookieName
  })

  // 检查是否为公开路径
  if (isPublicPath(config.name, pathname)) {
    console.log(`✅ 公开路径，允许访问: ${pathname}`)
    return NextResponse.next()
  }

  // 检查是否为保护路径
  if (isProtectedPath(config.name, pathname)) {
    if (!isLoggedIn) {
      console.log(`🚫 保护路径未登录，重定向到登录: ${pathname} -> ${config.loginPath}`)
      const loginUrl = new URL(config.loginPath, req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    console.log(`✅ 保护路径已认证，允许访问: ${pathname}`)
    return NextResponse.next()
  }

  // 如果路径不在配置的公开或保护路径中，默认允许访问
  console.log(`⚠️  路径不在配置中，默认允许: ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
