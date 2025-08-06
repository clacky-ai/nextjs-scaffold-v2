import { getServerSession } from 'next-auth'
import { adminAuthOptions } from './admin-auth'

export async function verifyAdminAuth() {
  try {
    const session = await getServerSession(adminAuthOptions)
    
    if (!session?.user) {
      return null
    }
    
    return {
      user: {
        id: (session.user as any).id,
        username: (session.user as any).username,
        name: session.user.name || '',
        email: session.user.email || '',
      }
    }
  } catch (error) {
    console.error('管理员session验证失败:', error)
    return null
  }
}
