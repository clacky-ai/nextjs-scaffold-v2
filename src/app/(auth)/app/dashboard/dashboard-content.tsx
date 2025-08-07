"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProjectSubmissionForm } from "./components/project-submission-form";
import { VotingSection } from "./components/voting-section";
import { MyVotesSection } from "./components/my-votes-section";
import { useSystemStore, useVoteStore } from "@/stores/user";

export function DashboardContent() {
  const { data: session } = useSession();
  const {
    settings: systemStatus,
    isVotingEnabled,
    getMaxVotesPerUser,
  } = useSystemStore();
  const { stats } = useVoteStore();

  const voteStats = stats(getMaxVotesPerUser());

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">投票系统</h1>
              <p className="text-sm text-gray-600">
                欢迎，{session?.user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant={isVotingEnabled() ? "default" : "secondary"}>
                  {isVotingEnabled() ? "投票开启" : "投票暂停"}
                </Badge>
                <Badge variant="outline">
                  剩余 {voteStats.remainingVotes} 票
                </Badge>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">项目列表</TabsTrigger>
              <TabsTrigger value="submit">提交项目</TabsTrigger>
              <TabsTrigger value="vote">我的投票</TabsTrigger>
              <TabsTrigger value="results">投票结果</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>参赛项目</CardTitle>
                  <CardDescription>
                    浏览所有参赛项目并进行投票
                    <span className="ml-2">
                      （每人最多 {getMaxVotesPerUser()} 票）
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VotingSection userId={(session?.user as any)?.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>提交项目</CardTitle>
                  <CardDescription>提交您的参赛项目信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectSubmissionForm userId={(session?.user as any)?.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vote" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>我的投票</CardTitle>
                  <CardDescription>查看您的投票记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <MyVotesSection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>投票结果</CardTitle>
                  <CardDescription>实时投票结果统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <VotingSection
                    userId={(session?.user as any)?.id}
                    viewOnly={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
