"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectStore, useVoteStore, useSystemStore } from "@/stores/user";
import { toast } from "sonner";

interface VotingSectionProps {
  userId: string;
  viewOnly?: boolean;
}

export function VotingSection({
  userId,
  viewOnly = false,
}: VotingSectionProps) {
  const [voteReason, setVoteReason] = useState("");

  // Zustand stores
  const { sortedProjects, loading: projectLoading } = useProjectStore();

  const {
    userVotes,
    canVote,
    getVoteButtonText,
    submitVote,
    loading: voteLoading,
  } = useVoteStore();

  const {
    settings: systemStatus,
    isVotingEnabled,
    getMaxVotesPerUser,
  } = useSystemStore();

  const projects = sortedProjects();
  const isLoading = projectLoading.fetchProjects;

  // Show toast notifications for vote updates (only in non-view-only mode)
  useEffect(() => {
    if (!viewOnly) {
      // This will be handled by the UserStoreProvider's WebSocket integration
      // The toast notifications are now managed centrally
    }
  }, [viewOnly]);

  const handleVote = async (projectId: string) => {
    const success = await submitVote(projectId, voteReason);
    if (success) {
      setVoteReason("");
    }
  };

  // Helper functions using store methods
  const canVoteForProject = (project: any) => {
    const teamMembers = JSON.parse(project.teamMembers || "[]");
    return (
      canVote(
        project.id,
        userId,
        getMaxVotesPerUser(),
        teamMembers,
        project.submitterId
      ) &&
      isVotingEnabled() &&
      !viewOnly
    );
  };

  const getVoteButtonTextForProject = (project: any) => {
    const teamMembers = JSON.parse(project.teamMembers || "[]");
    return getVoteButtonText(
      project.id,
      userId,
      getMaxVotesPerUser(),
      teamMembers,
      project.submitterId,
      isVotingEnabled()
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {!viewOnly && (
        <div className="text-sm text-gray-600">
          您已使用 {userVotes.length} / {getMaxVotesPerUser()} 票
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无项目</div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>
                      提交者: {project.submitterName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{project.voteCount} 票</Badge>
                    {project.category && (
                      <Badge variant="outline">{project.category}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{project.description}</p>

                {project.demoLink && (
                  <div className="mb-4">
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      查看演示 →
                    </a>
                  </div>
                )}

                {project.tags && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(project.tags).map(
                        (tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {!viewOnly && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!canVoteForProject(project)}
                        variant={
                          userVotes.includes(project.id)
                            ? "secondary"
                            : "default"
                        }
                      >
                        {getVoteButtonTextForProject(project)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>为 "{project.title}" 投票</DialogTitle>
                        <DialogDescription>
                          请说明您的投票理由和评价
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reason">投票理由 *</Label>
                          <Textarea
                            id="reason"
                            value={voteReason}
                            onChange={(e) => setVoteReason(e.target.value)}
                            placeholder="请说明您为什么选择这个项目..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => handleVote(project.id)}
                            disabled={
                              voteLoading[`submitVote_${project.id}`] ||
                              !voteReason.trim()
                            }
                          >
                            {voteLoading[`submitVote_${project.id}`]
                              ? "投票中..."
                              : "确认投票"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
