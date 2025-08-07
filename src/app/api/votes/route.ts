import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes, projects, votingSystemStatus } from "@/lib/db/schema";
import { getUserSession } from "@/lib/auth/utils";
import { eq, and, sql } from "drizzle-orm";
import { broadcastVoteUpdate } from "../../../pages/api/socket";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取用户的投票记录
    const userVotes = await db.query.votes.findMany({
      where: eq(votes.voterId, session.user.id),
      with: {
        project: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(userVotes);
  } catch (error) {
    console.error("获取投票记录错误:", error);
    return NextResponse.json({ error: "获取投票记录失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { projectId, reason } = await request.json();

    // 验证必填字段
    if (!projectId || !reason) {
      return NextResponse.json(
        { error: "项目ID和投票理由为必填项" },
        { status: 400 }
      );
    }

    // 检查投票系统状态
    const systemStatus = await db.query.votingSystemStatus.findFirst({
      orderBy: (votingSystemStatus, { desc }) => [
        desc(votingSystemStatus.updatedAt),
      ],
    });

    // 如果没有系统状态记录，使用默认值（投票开启）
    const isVotingEnabled = systemStatus?.isVotingEnabled ?? true;
    const maxVotesPerUser = systemStatus?.maxVotesPerUser ?? 3;

    if (!isVotingEnabled) {
      return NextResponse.json({ error: "投票系统已暂停" }, { status: 403 });
    }

    // 检查项目是否存在且未被屏蔽
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.isBlocked, false)),
    });

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或已被屏蔽" },
        { status: 404 }
      );
    }

    // 检查是否为自己的项目
    const teamMembers = JSON.parse(project.teamMembers);
    if (
      teamMembers.includes(session.user.id) ||
      project.submitterId === session.user.id
    ) {
      return NextResponse.json(
        { error: "不能给自己的项目投票" },
        { status: 403 }
      );
    }

    // 检查是否已经投过票
    const existingVote = await db.query.votes.findFirst({
      where: and(
        eq(votes.voterId, session.user.id),
        eq(votes.projectId, projectId)
      ),
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "您已经给该项目投过票了" },
        { status: 400 }
      );
    }

    // 检查投票数量限制
    const userVoteCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(votes)
      .where(eq(votes.voterId, session.user.id));

    if (userVoteCount[0].count >= maxVotesPerUser) {
      return NextResponse.json(
        {
          error: `您已达到最大投票数量限制（${maxVotesPerUser}票）`,
        },
        { status: 400 }
      );
    }

    // 创建投票
    const [newVote] = await db
      .insert(votes)
      .values({
        voterId: session.user.id,
        projectId,
        reason,
      })
      .returning();

    // 获取更新后的项目信息和投票数
    const updatedProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: {
        id: true,
        title: true,
      },
    });

    // 计算项目的总投票数
    const voteCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(eq(votes.projectId, projectId));

    const newVoteCount = voteCountResult[0]?.count || 0;

    // 广播投票更新消息
    if (updatedProject) {
      broadcastVoteUpdate({
        projectId: updatedProject.id,
        projectTitle: updatedProject.title,
        newVoteCount: newVoteCount,
        voterName: session.user?.name || "匿名用户",
      });
    }

    return NextResponse.json({
      message: "投票成功",
      vote: newVote,
    });
  } catch (error) {
    console.error("投票错误:", error);
    return NextResponse.json(
      { error: "投票失败，请稍后重试" },
      { status: 500 }
    );
  }
}
