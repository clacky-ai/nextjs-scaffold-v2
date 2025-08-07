'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useUserWebSocketStore } from '@/stores/user'
import type { AdminMessageData } from '@/stores/user/types'

interface WebSocketContextType {
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({ isConnected: false })

export function useWebSocket() {
  return useContext(WebSocketContext)
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession()
  const { 
    connection, 
    connect, 
    disconnect, 
    authenticate,
    onAdminMessage,
    offAdminMessage,
    joinVotingRoom
  } = useUserWebSocketStore()

  // 初始化连接
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // 当用户登录状态改变时，进行Socket认证和房间管理
  useEffect(() => {
    if (status === 'authenticated' && session?.user && connection.isConnected) {
      // 用户认证
      authenticate({
        userId: (session.user as any).id,
        userName: session.user.name || '',
        userEmail: session.user.email || '',
        isAdmin: false
      })
      
    }
  }, [session, status, connection.isConnected, authenticate, joinVotingRoom])

  // 监听管理员消息
  useEffect(() => {
    if (status === 'authenticated' && connection.isConnected) {
      const handleAdminMessage = (data: AdminMessageData) => {
        // 根据消息类型显示不同的toast
        const toastOptions = {
          duration: 6000,
          description: `来自管理员: ${data.from}`,
          action: {
            label: '关闭',
            onClick: () => {}
          }
        }

        switch (data.type) {
          case 'success':
            toast.success(data.title, {
              ...toastOptions,
              description: `${data.message}\n来自管理员: ${data.from}`
            })
            break
          case 'warning':
            toast.warning(data.title, {
              ...toastOptions,
              description: `${data.message}\n来自管理员: ${data.from}`
            })
            break
          case 'error':
            toast.error(data.title, {
              ...toastOptions,
              description: `${data.message}\n来自管理员: ${data.from}`
            })
            break
          case 'info':
          default:
            toast.info(data.title, {
              ...toastOptions,
              description: `${data.message}\n来自管理员: ${data.from}`
            })
            break
        }
      }

      onAdminMessage(handleAdminMessage)

      return () => {
        offAdminMessage()
      }
    }
  }, [status, connection.isConnected, onAdminMessage, offAdminMessage])

  const contextValue: WebSocketContextType = {
    isConnected: connection.isConnected
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}