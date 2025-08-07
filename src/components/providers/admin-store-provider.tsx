'use client'

import { useEffect } from 'react'
import { useSystemStore } from '@/stores/admin'

interface AdminStoreProviderProps {
  children: React.ReactNode
}

export function AdminStoreProvider({ children }: AdminStoreProviderProps) {
  const { fetchSettings } = useSystemStore()
  
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])
  
  return <>{children}</>
}