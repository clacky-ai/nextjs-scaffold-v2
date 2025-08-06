import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码为必填项' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 获取当前管理员信息
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, session.user.id)
    })

    if (!admin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      )
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: '当前密码错误' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await db
      .update(adminUsers)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, session.user.id))

    return NextResponse.json({
      message: '密码修改成功'
    })

  } catch (error) {
    console.error('修改密码错误:', error)
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    )
  }
}
