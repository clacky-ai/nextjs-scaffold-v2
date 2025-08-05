import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects, users, votes } from '@/lib/db/schema'
import { verifyAdminAuth } from '@/lib/auth/admin-auth-helper'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取所有项目及其投票数
    const allProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        teamMembers: projects.teamMembers,
        demoLink: projects.demoLink,
        category: projects.category,
        tags: projects.tags,
        submitterId: projects.submitterId,
        submitterName: users.name,
        submitterEmail: users.email,
        isBlocked: projects.isBlocked,
        createdAt: projects.createdAt,
        voteCount: sql<number>`count(${votes.id})::int`,
      })
      .from(projects)
      .leftJoin(users, eq(projects.submitterId, users.id))
      .leftJoin(votes, eq(projects.id, votes.projectId))
      .groupBy(projects.id, users.name, users.email)
      .orderBy(projects.createdAt)

    return NextResponse.json(allProjects)
  } catch (error) {
    console.error('获取项目列表错误:', error)
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAdminAuth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { projectId, isBlocked } = await request.json()

    if (!projectId || typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: '项目ID和屏蔽状态为必填项' },
        { status: 400 }
      )
    }

    const [updatedProject] = await db
      .update(projects)
      .set({ 
        isBlocked,
        updatedAt: new Date()
      })
      .where(eq(projects.id, projectId))
      .returning({
        id: projects.id,
        title: projects.title,
        isBlocked: projects.isBlocked,
      })

    if (!updatedProject) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: isBlocked ? '项目已被屏蔽' : '项目已恢复',
      project: updatedProject
    })

  } catch (error) {
    console.error('更新项目状态错误:', error)
    return NextResponse.json(
      { error: '更新项目状态失败' },
      { status: 500 }
    )
  }
}
