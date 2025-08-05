import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('管理员退出登录API被调用')

    // 创建响应
    const response = NextResponse.json({
      message: '退出登录成功'
    })

    // 最简单直接的方式清除admin-token cookie
    response.cookies.delete('admin-token')

    // 也尝试用传统方式清除
    response.cookies.set('admin-token', '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    console.log('退出登录API执行完成，admin-token cookie已清除')

    return response

  } catch (error) {
    console.error('管理员退出登录错误:', error)
    return NextResponse.json(
      { error: '退出登录失败' },
      { status: 500 }
    )
  }
}
