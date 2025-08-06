import { getServerSession } from 'next-auth'
import { userAuthOptions } from './user-auth'
import { adminAuthOptions } from './admin-auth'
import { redirect } from 'next/navigation'

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