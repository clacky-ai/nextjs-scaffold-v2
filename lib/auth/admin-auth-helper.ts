import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin-token')?.value

    if (!adminToken) {
      return null
    }

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
    return null
  }
}
