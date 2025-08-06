import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'

// 这个路由已被弃用，系统设置功能已移除
// 现在设置面板专注于管理员管理功能
export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    return NextResponse.json({
      message: '系统设置功能已移除，请使用管理员管理功能'
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: 'API错误' },
      { status: 500 }
    )
  }
}
