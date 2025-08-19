import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "@/hooks/useProjects";
import { useVotes, useProjectVoteCheck, type VoteData } from "@/hooks/useVotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Star,
  Users,
  ExternalLink,
  Github,
  FileText,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Link, useParams } from "wouter";

// 投票表单schema
const voteSchema = z.object({
  innovationScore: z.number().min(1, "创新性评分不能低于1分").max(10, "创新性评分不能超过10分"),
  technicalScore: z.number().min(1, "技术实现评分不能低于1分").max(10, "技术实现评分不能超过10分"),
  practicalityScore: z.number().min(1, "实用性评分不能低于1分").max(10, "实用性评分不能超过10分"),
  presentationScore: z.number().min(1, "展示效果评分不能低于1分").max(10, "展示效果评分不能超过10分"),
  teamworkScore: z.number().min(1, "团队协作评分不能低于1分").max(10, "团队协作评分不能超过10分"),
  comment: z.string().min(10, "评价至少10个字符"),
});

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useProject(id!);
  const { data: voteCheck, isLoading: isVoteCheckLoading } = useProjectVoteCheck(id!);
  const { submitVote, isSubmittingVote, remainingVotes } = useVotes();

  const form = useForm<VoteData>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      projectId: id,
      innovationScore: 5,
      technicalScore: 5,
      practicalityScore: 5,
      presentationScore: 5,
      teamworkScore: 5,
      comment: "",
    },
  });

  const onSubmit = (data: VoteData) => {
    submitVote(data);
  };

  if (isProjectLoading || isVoteCheckLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">项目不存在</h3>
          <p className="text-gray-600 mb-4">您访问的项目不存在或已被删除</p>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 如果已经投票
  if (voteCheck?.hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">投票详情</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">您已投票</h3>
            <p className="text-gray-600 mb-4">您已经为项目"{project.title}"投过票了</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 如果没有剩余投票次数
  if (remainingVotes <= 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">投票详情</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">投票次数已用完</h3>
            <p className="text-gray-600 mb-4">您的投票次数已用完（最多3票），无法继续投票</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">为项目投票</h1>
            </div>
            <div className="text-sm text-gray-600">
              剩余投票次数: <span className="font-medium text-blue-600">{remainingVotes}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 项目信息 */}
          <Card>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>
                提交时间：{new Date(project.submittedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600">{project.description}</p>
              
              {/* 标签 */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* 团队成员 */}
              {project.teamMembers.length > 0 && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    团队成员：{project.teamMembers.map(m => m.name).join("、")}
                  </span>
                </div>
              )}
              
              {/* 链接 */}
              <div className="flex flex-wrap gap-2">
                {project.demoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      演示
                    </a>
                  </Button>
                )}
                {project.repositoryUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      代码
                    </a>
                  </Button>
                )}
                {project.presentationUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.presentationUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      演示文稿
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 投票表单 */}
          <Card>
            <CardHeader>
              <CardTitle>评分投票</CardTitle>
              <CardDescription>
                请对项目的各个维度进行评分（1-10分）并提供评价
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 评分维度 */}
                <div className="space-y-6">
                  {[
                    { key: 'innovationScore', label: '创新性', description: '项目的创新程度和独特性' },
                    { key: 'technicalScore', label: '技术实现', description: '技术方案的合理性和实现质量' },
                    { key: 'practicalityScore', label: '实用性', description: '项目的实际应用价值' },
                    { key: 'presentationScore', label: '展示效果', description: '项目展示的完整性和清晰度' },
                    { key: 'teamworkScore', label: '团队协作', description: '团队合作和项目管理能力' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">{label}</Label>
                        <span className="text-sm text-blue-600 font-medium">
                          {form.watch(key as keyof VoteData)} 分
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{description}</p>
                      <Slider
                        value={[form.watch(key as keyof VoteData) as number]}
                        onValueChange={(value) => form.setValue(key as keyof VoteData, value[0] as any)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* 评价 */}
                <div className="space-y-2">
                  <Label htmlFor="comment">评价 *</Label>
                  <Textarea
                    id="comment"
                    placeholder="请详细说明您的评分理由，包括项目的优点和改进建议..."
                    rows={4}
                    {...form.register("comment")}
                  />
                  {form.formState.errors.comment && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.comment.message}
                    </p>
                  )}
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Link href="/">
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmittingVote}>
                    {isSubmittingVote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    提交投票
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
