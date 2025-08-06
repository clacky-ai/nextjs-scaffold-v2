'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function CookieDebugPage() {
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
        <h1 className="text-2xl font-bold mb-6">Cookie 和 Session 调试页面</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* 普通用户 Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">普通用户 Session</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
              <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
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

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">测试说明</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 先在 <a href="/sign-in" className="underline">/sign-in</a> 登录用户账号</li>
            <li>• 再在 <a href="/admin/sign-in" className="underline">/admin/sign-in</a> 登录管理员账号</li>
            <li>• 然后查看这个页面的 Cookie 和 Session 状态</li>
            <li>• 检查是否有 cookie 名称冲突</li>
          </ul>
        </div>
      </div>
    </div>
  )
}