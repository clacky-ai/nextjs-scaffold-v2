'use client'

import { useEffect } from 'react'

interface AdminStoreProviderProps {
  children: React.ReactNode
}

export function AdminStoreProvider({ children }: AdminStoreProviderProps) {
  return <>{children}</>
}