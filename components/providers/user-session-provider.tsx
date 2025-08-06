'use client'

import { SessionProvider } from 'next-auth/react'

interface UserSessionProviderProps {
  children: React.ReactNode
}

export function UserSessionProvider({ children }: UserSessionProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}