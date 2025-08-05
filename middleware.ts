import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 公开路径，无需认证
  const publicPaths = ['/', '/sign-up', '/sign-in', '/admin/sign-in']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // API路由的认证在各自的处理函数中进行
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 管理员路由保护
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('admin-token')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/sign-in', req.url))
    }

    // 简单检查token是否存在，详细验证在API中进行
    return NextResponse.next()
  }

  // 用户路由保护 - 使用NextAuth的session
  if (pathname.startsWith('/dashboard')) {
    // 检查NextAuth session token
    const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
                        req.cookies.get('__Secure-next-auth.session-token')?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
