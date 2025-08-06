'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { AdminSessionProvider } from '@/components/providers/admin-session-provider'

function AdminCookieDebugInner() {
  const { data: session, status } = useSession()
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    // 获取所有 cookie
    const allCookies = document.cookie.split(';').map(cookie => cookie.trim())
    setCookies(allCookies)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">管理员 Cookie 和 Session 调试页面</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* 管理员 Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">管理员 Session</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
              <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
              <p><strong>Username:</strong> {(session?.user as any)?.username || 'N/A'}</p>
            </div>
          </div>

          {/* Cookie 列表 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">当前 Cookies</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {cookies.map((cookie, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {cookie}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">管理员调试页面</h3>
          <p className="text-sm text-blue-700">
            这个页面使用 AdminSessionProvider，显示管理员的 session 信息
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminCookieDebugPage() {
  return (
    <AdminSessionProvider>
      <AdminCookieDebugInner />
    </AdminSessionProvider>
  )
}