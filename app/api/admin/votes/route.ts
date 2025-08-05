import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { votes, users, projects } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取所有投票记录
    const allVotes = await db
      .select({
        id: votes.id,
        reason: votes.reason,
        createdAt: votes.createdAt,
        voter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        project: {
          id: projects.id,
          title: projects.title,
        }
      })
      .from(votes)
      .leftJoin(users, eq(votes.voterId, users.id))
      .leftJoin(projects, eq(votes.projectId, projects.id))
      .orderBy(votes.createdAt)

    return NextResponse.json(allVotes)
  } catch (error) {
    console.error('获取投票列表错误:', error)
    return NextResponse.json(
      { error: '获取投票列表失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { voteId } = await request.json()

    if (!voteId) {
      return NextResponse.json(
        { error: '投票ID为必填项' },
        { status: 400 }
      )
    }

    const [deletedVote] = await db
      .delete(votes)
      .where(eq(votes.id, voteId))
      .returning({
        id: votes.id,
      })

    if (!deletedVote) {
      return NextResponse.json(
        { error: '投票记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '投票记录已删除',
      voteId: deletedVote.id
    })

  } catch (error) {
    console.error('删除投票记录错误:', error)
    return NextResponse.json(
      { error: '删除投票记录失败' },
      { status: 500 }
    )
  }
}
