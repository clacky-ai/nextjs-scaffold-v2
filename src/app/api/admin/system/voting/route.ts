import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { votingSystemStatus } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { broadcastSystemStatusUpdate } from '@/pages/api/socket'

// 更新投票系统状态
export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { isVotingEnabled, maxVotesPerUser } = await request.json()

    // 验证参数
    if (typeof isVotingEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'isVotingEnabled 必须是布尔值' },
        { status: 400 }
      )
    }

    if (maxVotesPerUser !== undefined && (typeof maxVotesPerUser !== 'number' || maxVotesPerUser < 1)) {
      return NextResponse.json(
        { error: 'maxVotesPerUser 必须是大于0的数字' },
        { status: 400 }
      )
    }

    // 获取当前状态
    const currentStatus = await db.query.votingSystemStatus.findFirst({
      orderBy: (votingSystemStatus, { desc }) => [desc(votingSystemStatus.updatedAt)]
    })

    // 创建新的状态记录
    const [newStatus] = await db.insert(votingSystemStatus).values({
      isVotingEnabled,
      maxVotesPerUser: maxVotesPerUser ?? currentStatus?.maxVotesPerUser ?? 3,
      updatedBy: session.user.id,
    }).returning()

    // 广播状态更新给所有连接的客户端
    const broadcastCount = broadcastSystemStatusUpdate({
      isVotingEnabled: newStatus.isVotingEnabled,
      maxVotesPerUser: newStatus.maxVotesPerUser
    })

    console.log(`✅ 投票系统状态已更新: ${isVotingEnabled ? '开启' : '暂停'}`)
    console.log(`📡 已广播给 ${broadcastCount} 个客户端`)

    return NextResponse.json({
      success: true,
      data: {
        isVotingEnabled: newStatus.isVotingEnabled,
        maxVotesPerUser: newStatus.maxVotesPerUser,
        updatedAt: newStatus.updatedAt,
        updatedBy: newStatus.updatedBy
      },
      broadcastCount
    })

  } catch (error) {
    console.error('更新投票系统状态失败:', error)
    return NextResponse.json(
      { error: '更新投票系统状态失败' },
      { status: 500 }
    )
  }
}
