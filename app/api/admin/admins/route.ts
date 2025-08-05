import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq } from 'drizzle-orm'

// 获取所有管理员列表
export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const allAdmins = await db.query.adminUsers.findMany({
      columns: {
        password: false, // 不返回密码
      },
      orderBy: (adminUsers, { desc }) => [desc(adminUsers.createdAt)]
    })

    return NextResponse.json(allAdmins)
  } catch (error) {
    console.error('获取管理员列表错误:', error)
    return NextResponse.json(
      { error: '获取管理员列表失败' },
      { status: 500 }
    )
  }
}

// 创建新管理员
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { username, password, name, email } = await request.json()

    if (!username || !password || !name || !email) {
      return NextResponse.json(
        { error: '用户名、密码、姓名和邮箱为必填项' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, username)
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingEmail = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email)
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已存在' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建新管理员
    const [newAdmin] = await db.insert(adminUsers).values({
      username,
      password: hashedPassword,
      name,
      email,
    }).returning({
      id: adminUsers.id,
      username: adminUsers.username,
      name: adminUsers.name,
      email: adminUsers.email,
      createdAt: adminUsers.createdAt,
    })

    return NextResponse.json({
      message: '管理员创建成功',
      admin: newAdmin
    })

  } catch (error) {
    console.error('创建管理员错误:', error)
    return NextResponse.json(
      { error: '创建管理员失败' },
      { status: 500 }
    )
  }
}
