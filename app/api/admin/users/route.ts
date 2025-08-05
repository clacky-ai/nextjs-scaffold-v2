import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const allUsers = await db.query.users.findMany({
      columns: {
        password: false, // 不返回密码
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    })

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('获取用户列表错误:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { userId, isBlocked } = await request.json()

    if (!userId || typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: '用户ID和屏蔽状态为必填项' },
        { status: 400 }
      )
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        isBlocked,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        isBlocked: users.isBlocked,
      })

    if (!updatedUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: isBlocked ? '用户已被屏蔽' : '用户已恢复',
      user: updatedUser
    })

  } catch (error) {
    console.error('更新用户状态错误:', error)
    return NextResponse.json(
      { error: '更新用户状态失败' },
      { status: 500 }
    )
  }
}
