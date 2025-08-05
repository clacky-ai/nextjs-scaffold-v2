import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq, ne } from 'drizzle-orm'

// 更新管理员信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const adminId = params.id
    const { username, name, email, password } = await request.json()

    if (!username || !name || !email) {
      return NextResponse.json(
        { error: '用户名、姓名和邮箱为必填项' },
        { status: 400 }
      )
    }

    // 检查要更新的管理员是否存在
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, adminId)
    })

    if (!existingAdmin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      )
    }

    // 检查用户名是否被其他管理员使用
    const duplicateUsername = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, username)
    })

    if (duplicateUsername && duplicateUsername.id !== adminId) {
      return NextResponse.json(
        { error: '用户名已被其他管理员使用' },
        { status: 400 }
      )
    }

    // 检查邮箱是否被其他管理员使用
    const duplicateEmail = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email)
    })

    if (duplicateEmail && duplicateEmail.id !== adminId) {
      return NextResponse.json(
        { error: '邮箱已被其他管理员使用' },
        { status: 400 }
      )
    }

    // 准备更新数据
    const updateData: any = {
      username,
      name,
      email,
      updatedAt: new Date()
    }

    // 如果提供了新密码，则加密并更新
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: '密码长度至少为6位' },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    // 更新管理员信息
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, adminId))
      .returning({
        id: adminUsers.id,
        username: adminUsers.username,
        name: adminUsers.name,
        email: adminUsers.email,
        updatedAt: adminUsers.updatedAt,
      })

    return NextResponse.json({
      message: '管理员信息更新成功',
      admin: updatedAdmin
    })

  } catch (error) {
    console.error('更新管理员错误:', error)
    return NextResponse.json(
      { error: '更新管理员失败' },
      { status: 500 }
    )
  }
}

// 删除管理员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const adminId = params.id

    // 不能删除自己
    if (adminId === session.user.id) {
      return NextResponse.json(
        { error: '不能删除自己的账号' },
        { status: 400 }
      )
    }

    // 检查管理员是否存在
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, adminId)
    })

    if (!existingAdmin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      )
    }

    // 检查是否是最后一个管理员
    const adminCount = await db.query.adminUsers.findMany()
    if (adminCount.length <= 1) {
      return NextResponse.json(
        { error: '不能删除最后一个管理员账号' },
        { status: 400 }
      )
    }

    // 删除管理员
    await db.delete(adminUsers).where(eq(adminUsers.id, adminId))

    return NextResponse.json({
      message: '管理员删除成功'
    })

  } catch (error) {
    console.error('删除管理员错误:', error)
    return NextResponse.json(
      { error: '删除管理员失败' },
      { status: 500 }
    )
  }
}
