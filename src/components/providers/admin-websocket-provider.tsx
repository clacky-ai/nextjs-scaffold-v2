'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocketStore } from '@/stores/admin'

interface AdminWebSocketContextType {
  isConnected: boolean
  onlineUserCount: number
}

const AdminWebSocketContext = createContext<AdminWebSocketContextType>({ 
  isConnected: false,
  onlineUserCount: 0
})

export function useAdminWebSocket() {
  return useContext(AdminWebSocketContext)
}

interface AdminWebSocketProviderProps {
  children: React.ReactNode
}

export function AdminWebSocketProvider({ children }: AdminWebSocketProviderProps) {
  const { data: session, status } = useSession()
  const { 
    connection, 
    onlineUserCount,
    connect, 
    disconnect, 
    authenticate 
  } = useWebSocketStore()

  // 初始化连接
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // 当管理员登录状态改变时，进行Socket认证
  useEffect(() => {
    if (status === 'authenticated' && session?.user && connection.isConnected) {
      // 管理员认证
      authenticate({
        userId: session.user.id,
        userName: session.user.name || '',
        userEmail: session.user.email || '',
        isAdmin: true
      })
    }
  }, [session, status, connection.isConnected, authenticate])

  const contextValue: AdminWebSocketContextType = {
    isConnected: connection.isConnected,
    onlineUserCount
  }

  return (
    <AdminWebSocketContext.Provider value={contextValue}>
      {children}
    </AdminWebSocketContext.Provider>
  )
}