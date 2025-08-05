import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { votingSystemStatus } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { broadcastSystemStatusUpdate } from '../../../../pages/api/socket'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const systemStatus = await db.query.votingSystemStatus.findFirst({
      orderBy: [desc(votingSystemStatus.updatedAt)]
    })

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error('获取系统状态错误:', error)
    return NextResponse.json(
      { error: '获取系统状态失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { isVotingEnabled, maxVotesPerUser } = await request.json()

    if (typeof isVotingEnabled !== 'boolean' || typeof maxVotesPerUser !== 'number') {
      return NextResponse.json(
        { error: '投票状态和最大投票数为必填项' },
        { status: 400 }
      )
    }

    if (maxVotesPerUser < 1 || maxVotesPerUser > 10) {
      return NextResponse.json(
        { error: '最大投票数必须在1-10之间' },
        { status: 400 }
      )
    }

    const [newStatus] = await db.insert(votingSystemStatus).values({
      isVotingEnabled,
      maxVotesPerUser,
      updatedBy: session.user.id,
    }).returning()

    // 广播系统状态更新消息
    broadcastSystemStatusUpdate({
      isVotingEnabled: newStatus.isVotingEnabled,
      maxVotesPerUser: newStatus.maxVotesPerUser
    })

    return NextResponse.json({
      message: '系统设置已更新',
      status: newStatus
    })

  } catch (error) {
    console.error('更新系统设置错误:', error)
    return NextResponse.json(
      { error: '更新系统设置失败' },
      { status: 500 }
    )
  }
}
