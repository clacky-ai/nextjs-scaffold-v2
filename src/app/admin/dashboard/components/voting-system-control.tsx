"use client";

import { useEffect, useState } from "react";
import { Power, Settings, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSystemStore } from "@/stores/admin";

interface VotingSystemControlProps {
  className?: string;
}

export function VotingSystemControl({ className }: VotingSystemControlProps) {
  const {
    settings,
    loading,
    fetchSettings,
    toggleVoting,
    updateMaxVotes,
    isVotingEnabled,
    getMaxVotesPerUser,
  } = useSystemStore();

  const [maxVotesInput, setMaxVotesInput] = useState(
    getMaxVotesPerUser().toString()
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setMaxVotesInput(getMaxVotesPerUser().toString());
  }, [settings.maxVotesPerUser]);

  const handleToggleVoting = async () => {
    await toggleVoting();
  };

  const handleUpdateMaxVotes = async () => {
    const newMaxVotes = parseInt(maxVotesInput);
    if (isNaN(newMaxVotes) || newMaxVotes < 1) {
      setMaxVotesInput(getMaxVotesPerUser().toString());
      return;
    }

    if (newMaxVotes !== getMaxVotesPerUser()) {
      await updateMaxVotes(newMaxVotes);
    }
  };

  const handleMaxVotesKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateMaxVotes();
    }
  };

  const isLoading = loading.updateSettings || loading.fetchSettings;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>投票系统控制</CardTitle>
          </div>
          <Badge
            variant={isVotingEnabled() ? "default" : "secondary"}
            className="flex items-center space-x-1"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVotingEnabled() ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span>{isVotingEnabled() ? "运行中" : "已暂停"}</span>
          </Badge>
        </div>
        <CardDescription>管理投票系统的开启/关闭状态和相关设置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 投票开关 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Power className="h-4 w-4" />
              <Label className="text-sm font-medium">投票系统状态</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {isVotingEnabled() ? "用户可以正常投票" : "用户无法进行投票"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant={isVotingEnabled() ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleVoting}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {isLoading
                ? "更新中..."
                : isVotingEnabled()
                ? "暂停投票"
                : "开启投票"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* 最大投票数设置 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <Label className="text-sm font-medium">每用户最大投票数</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              min="1"
              max="10"
              value={maxVotesInput}
              onChange={(e) => setMaxVotesInput(e.target.value)}
              onBlur={handleUpdateMaxVotes}
              onKeyPress={handleMaxVotesKeyPress}
              disabled={isLoading}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">票</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateMaxVotes}
              disabled={
                isLoading || maxVotesInput === getMaxVotesPerUser().toString()
              }
            >
              更新
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            当前设置：每个用户最多可以投 {getMaxVotesPerUser()} 票
          </p>
        </div>

        <Separator />

        {/* 系统状态信息 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <Label className="text-sm font-medium">系统信息</Label>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">投票状态：</span>
              <span
                className={`font-medium ${
                  isVotingEnabled() ? "text-green-600" : "text-red-600"
                }`}
              >
                {isVotingEnabled() ? "开启" : "暂停"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">最大投票数：</span>
              <span className="font-medium">{getMaxVotesPerUser()} 票</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
