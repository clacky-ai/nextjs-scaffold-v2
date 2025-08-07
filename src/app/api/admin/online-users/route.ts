import { NextRequest, NextResponse } from 'next/server'
import { getOnlineUsersData } from '@/pages/api/socket'

export async function GET(request: NextRequest) {
  try {
    const onlineUsers = getOnlineUsersData()
    return NextResponse.json({
      success: true,
      data: onlineUsers
    })
  } catch (error) {
    console.error('获取在线用户失败:', error)
    return NextResponse.json(
      { success: false, error: '获取在线用户失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { targetUserId, title, message, type = 'info' } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: '标题和消息内容不能为空' },
        { status: 400 }
      )
    }

    // 这里可以添加管理员权限验证逻辑
    
    const messageData = {
      id: `msg_${Date.now()}_api`,
      title,
      message,
      type,
      from: 'API',
      timestamp: Date.now()
    }

    // 通过 Socket.IO 发送消息
    const { broadcastMessageToUsers, sendMessageToUser } = await import('@/pages/api/socket')
    
    let sentCount = 0
    if (targetUserId) {
      const sent = sendMessageToUser(targetUserId, messageData)
      sentCount = sent ? 1 : 0
    } else {
      sentCount = broadcastMessageToUsers(messageData)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Message sent successfully',
        sentCount,
        targetUserId
      }
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    return NextResponse.json(
      { success: false, error: '发送消息失败' },
      { status: 500 }
    )
  }
}