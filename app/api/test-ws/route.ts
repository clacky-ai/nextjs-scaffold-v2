import { NextRequest, NextResponse } from 'next/server'
import { broadcastToUsers, broadcastMessage, broadcastVoteUpdate, broadcastSystemStatusUpdate, getStats } from '../../../pages/api/socket'

export async function POST(request: NextRequest) {
  try {
    const { type, payload } = await request.json()
    
    console.log('收到WebSocket测试请求:', { type, payload })
    
    let sentCount = 0
    
    switch (type) {
      case 'vote-update':
        sentCount = broadcastVoteUpdate({
          projectId: 'test-project-id',
          projectTitle: '测试项目',
          newVoteCount: 42,
          voterName: '测试用户',
          ...payload
        })
        break

      case 'system-status-update':
        sentCount = broadcastSystemStatusUpdate({
          isVotingEnabled: true,
          maxVotesPerUser: 5,
          ...payload
        })
        break

      case 'custom':
        sentCount = broadcastMessage('custom', {
          message: '这是一个测试消息',
          timestamp: Date.now(),
          ...payload
        })
        break

      default:
        sentCount = broadcastMessage(type || 'test', payload || { message: '默认测试消息' })
    }

    return NextResponse.json({
      success: true,
      message: `广播消息已发送给 ${sentCount} 个客户端`,
      sentCount
    })
  } catch (error) {
    console.error('WebSocket测试错误:', error)
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const stats = getStats()
  return NextResponse.json({
    message: 'Socket.IO测试端点',
    usage: 'POST with { type: "vote-update" | "system-status-update" | "custom", payload: {...} }',
    stats
  })
}
