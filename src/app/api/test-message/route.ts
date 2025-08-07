import { NextRequest, NextResponse } from 'next/server'
import { broadcastMessageToUsers } from '@/pages/api/socket'

// Simple test endpoint to broadcast a message to all users
export async function POST(request: NextRequest) {
  try {
    const messageData = {
      id: `test_${Date.now()}`,
      title: '系统测试消息',
      message: '这是一条测试消息，用于验证实时消息推送功能是否正常工作。',
      type: 'info' as const,
      from: '系统管理员',
      timestamp: Date.now()
    }

    const sentCount = broadcastMessageToUsers(messageData)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Test message sent',
        sentCount,
        messageData
      }
    })
  } catch (error) {
    console.error('发送测试消息失败:', error)
    return NextResponse.json(
      { success: false, error: '发送测试消息失败' },
      { status: 500 }
    )
  }
}