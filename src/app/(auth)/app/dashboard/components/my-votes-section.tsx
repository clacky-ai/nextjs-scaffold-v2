"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVoteStore } from "@/stores/user";

export function MyVotesSection() {
  const { votes, loading } = useVoteStore();
  const isLoading = loading.fetchUserVotes;

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">您还没有投票记录</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">您已投票 {votes.length} 次</div>

      {votes.map((vote) => (
        <Card key={vote.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{vote.project.title}</CardTitle>
                <CardDescription>
                  投票时间: {new Date(vote.createdAt).toLocaleString("zh-CN")}
                </CardDescription>
              </div>
              <Badge variant="default">已投票</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium mb-2">投票理由:</h4>
              <p className="text-gray-700">{vote.reason}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
