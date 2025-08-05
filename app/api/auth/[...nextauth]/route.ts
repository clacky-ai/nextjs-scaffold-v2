import NextAuth from 'next-auth'
import { userAuthOptions } from '@/lib/auth/user-auth'

const handler = NextAuth(userAuthOptions)

export { handler as GET, handler as POST }
