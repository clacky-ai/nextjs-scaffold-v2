import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取系统状态 - 这是一个公开的 API，不需要认证
export async function GET() {
  try {
    // 获取最新的系统状态
    const systemStatus = await db.query.votingSystemStatus.findFirst({
      orderBy: (votingSystemStatus, { desc }) => [
        desc(votingSystemStatus.updatedAt),
      ],
    });

    // 如果没有记录，返回默认值
    const response = {
      isVotingEnabled: systemStatus?.isVotingEnabled ?? true,
      maxVotesPerUser: systemStatus?.maxVotesPerUser ?? 3,
      lastUpdated: systemStatus?.updatedAt || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("获取系统状态失败:", error);

    // 如果数据库查询失败，返回默认值
    return NextResponse.json({
      isVotingEnabled: true,
      maxVotesPerUser: 3,
      lastUpdated: null,
    });
  }
}
