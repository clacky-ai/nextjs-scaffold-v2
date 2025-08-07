"use client";

import { useEffect, useState } from "react";
import { Vote, Download, Search, Filter, TrendingUp } from "lucide-react";
import { AdminPageLayout } from "../components/admin-page-layout";
import { ActionBar, ActionBarButton } from "../components/action-bar";
import { VoteManagement } from "../components/vote-management";
import { VotingSystemControl } from "../components/voting-system-control";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVoteStore } from "@/stores/admin";

export default function VotesPage() {
  const { votes, stats, loading, fetchVotes } = useVoteStore();

  const [searchTermLocal, setSearchTermLocal] = useState("");

  // Computed stats
  const currentStats = stats();
  const isLoading = loading.fetchVotes;

  // Calculate additional stats not in store
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekVotes = votes.filter(
    (v: any) => new Date(v.createdAt) >= weekAgo
  ).length;

  const uniqueVoters = new Set(votes.map((v: any) => v.userId)).size;

  useEffect(() => {
    fetchVotes();
  }, []);

  const handleStatsUpdate = () => {
    // Stats are computed automatically, no need for manual refresh
  };

  const handleExportVotes = () => {
    console.log("导出投票数据");
  };

  return (
    <AdminPageLayout breadcrumb={{ label: "投票管理", icon: Vote }}>
      <div className="space-y-6">
        {/* ActionBar - 标题、搜索和操作按钮 */}
        <ActionBar
          title="投票管理"
          description="查看和管理所有投票记录，分析投票趋势"
          showSearch={true}
          searchPlaceholder="搜索用户、项目或投票记录..."
          searchValue={searchTermLocal}
          onSearchChange={setSearchTermLocal}
          actions={
            <>
              <ActionBarButton variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                分析报告
              </ActionBarButton>
              <ActionBarButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </ActionBarButton>
              <ActionBarButton onClick={handleExportVotes}>
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </ActionBarButton>
            </>
          }
        />
        {/* 投票统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总投票数</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : currentStats.total}
              </div>
              <p className="text-xs text-muted-foreground">累计投票总数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日投票</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? "..." : currentStats.todayVotes}
              </div>
              <p className="text-xs text-muted-foreground">今天新增的投票</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本周投票</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : thisWeekVotes}
              </div>
              <p className="text-xs text-muted-foreground">本周新增的投票</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">参与用户</CardTitle>
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {isLoading ? "..." : uniqueVoters}
              </div>
              <p className="text-xs text-muted-foreground">参与投票的用户数</p>
            </CardContent>
          </Card>
        </div>

        {/* 投票系统控制 */}
        <VotingSystemControl />

        {/* 投票管理组件 */}
        <Card>
          <CardHeader>
            <CardTitle>投票记录</CardTitle>
            <CardDescription>
              查看所有投票记录的详细信息和统计数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoteManagement
              onStatsUpdate={handleStatsUpdate}
              searchTerm={searchTermLocal}
            />
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
