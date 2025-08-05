import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects, votes, users } from '@/lib/db/schema'
import { getUserSession } from '@/lib/auth/utils'
import { eq, sql, and } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取所有项目及其投票数
    const projectsWithVotes = await db
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
        isBlocked: projects.isBlocked,
        createdAt: projects.createdAt,
        voteCount: sql<number>`count(${votes.id})::int`,
      })
      .from(projects)
      .leftJoin(users, eq(projects.submitterId, users.id))
      .leftJoin(votes, eq(projects.id, votes.projectId))
      .where(eq(projects.isBlocked, false))
      .groupBy(projects.id, users.name)
      .orderBy(projects.createdAt)

    return NextResponse.json(projectsWithVotes)
  } catch (error) {
    console.error('获取项目列表错误:', error)
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { title, description, teamMembers, demoLink, category, tags } = await request.json()

    // 验证必填字段
    if (!title || !description || !teamMembers) {
      return NextResponse.json(
        { error: '项目标题、描述和团队成员为必填项' },
        { status: 400 }
      )
    }

    // 创建项目
    const [newProject] = await db.insert(projects).values({
      title,
      description,
      teamMembers: JSON.stringify(teamMembers),
      demoLink,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      submitterId: session.user.id,
    }).returning()

    return NextResponse.json({
      message: '项目提交成功',
      project: newProject
    })

  } catch (error) {
    console.error('创建项目错误:', error)
    return NextResponse.json(
      { error: '项目提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
