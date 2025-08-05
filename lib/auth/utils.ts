import { getServerSession } from 'next-auth'
import { userAuthOptions } from './user-auth'
import { adminAuthOptions } from './admin-auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getUserSession() {
  return await getServerSession(userAuthOptions)
}

export async function getAdminSession() {
  return await getServerSession(adminAuthOptions)
}

export async function requireUserAuth() {
  const session = await getUserSession()
  if (!session) {
    redirect('/sign-in')
  }
  return session
}

export async function requireAdminAuth() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/sign-in')
  }
  return session
}

// 自定义管理员JWT认证
export async function requireCustomAdminAuth() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin-token')?.value

  if (!adminToken) {
    redirect('/admin/sign-in')
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_NEXTAUTH_SECRET)
    const { payload } = await jwtVerify(adminToken, secret)

    return {
      user: {
        id: payload.id as string,
        username: payload.username as string,
        name: payload.name as string,
        email: payload.email as string,
      }
    }
  } catch (error) {
    console.error('管理员token验证失败:', error)
    redirect('/admin/sign-in')
  }
}
