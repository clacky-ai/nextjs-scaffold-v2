import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    console.log('管理员登录尝试:', { username, passwordLength: password?.length })

    if (!username || !password) {
      console.log('缺少用户名或密码')
      return NextResponse.json(
        { error: '用户名和密码为必填项' },
        { status: 400 }
      )
    }

    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, username)
    })
    console.log('查找管理员结果:', admin ? '找到' : '未找到')

    if (!admin) {
      console.log('管理员不存在:', username)
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)
    console.log('密码验证结果:', isPasswordValid)

    if (!isPasswordValid) {
      console.log('密码错误')
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 创建JWT token
    const secret = new TextEncoder().encode(process.env.ADMIN_NEXTAUTH_SECRET)
    const token = await new SignJWT({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    // 设置cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      }
    })

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response

  } catch (error) {
    console.error('管理员登录错误:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
