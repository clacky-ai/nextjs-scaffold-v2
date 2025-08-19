import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, type CreateProjectData } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Users, 
  Loader2,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "wouter";

// 项目提交表单schema
const submitProjectSchema = z.object({
  title: z.string().min(1, "项目标题不能为空"),
  description: z.string().min(10, "项目描述至少10个字符"),
  categoryId: z.string().optional(),
  demoUrl: z.string().url("请输入有效的演示链接").optional().or(z.literal("")),
  repositoryUrl: z.string().url("请输入有效的代码仓库链接").optional().or(z.literal("")),
  presentationUrl: z.string().url("请输入有效的演示文稿链接").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "成员姓名不能为空"),
    role: z.string().optional(),
  })).default([]),
});

export default function SubmitProjectPage() {
  const { user } = useAuth();
  const { categories, createProject, isCreatingProject } = useProjects();
  const [newTag, setNewTag] = useState("");

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(submitProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      demoUrl: "",
      repositoryUrl: "",
      presentationUrl: "",
      tags: [],
      teamMembers: [
        {
          id: user?.id || "",
          name: user?.realName || "",
          role: "项目负责人",
        }
      ],
    },
  });

  const { fields: teamMembers, append: addTeamMember, remove: removeTeamMember } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  const onSubmit = (data: CreateProjectData) => {
    createProject(data);
  };

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addNewTeamMember = () => {
    addTeamMember({
      id: `temp-${Date.now()}`,
      name: "",
      role: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">提交项目</h1>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>
              请填写完整的项目信息，提交后将进入投票环节
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">项目标题 *</Label>
                  <Input
                    id="title"
                    placeholder="请输入项目标题"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">项目描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述您的项目，包括功能特点、技术亮点等"
                    rows={4}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">项目分类</Label>
                  <Select onValueChange={(value) => form.setValue("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择项目分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 链接信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">项目链接</h3>
                
                <div>
                  <Label htmlFor="demoUrl">演示链接</Label>
                  <Input
                    id="demoUrl"
                    type="url"
                    placeholder="https://your-demo.com"
                    {...form.register("demoUrl")}
                  />
                  {form.formState.errors.demoUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.demoUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="repositoryUrl">代码仓库</Label>
                  <Input
                    id="repositoryUrl"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    {...form.register("repositoryUrl")}
                  />
                  {form.formState.errors.repositoryUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.repositoryUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="presentationUrl">演示文稿</Label>
                  <Input
                    id="presentationUrl"
                    type="url"
                    placeholder="https://docs.google.com/presentation/..."
                    {...form.register("presentationUrl")}
                  />
                  {form.formState.errors.presentationUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.presentationUrl.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 标签 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">项目标签</h3>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="添加标签"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {form.watch("tags").length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.watch("tags").map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 团队成员 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">团队成员</h3>
                  <Button type="button" variant="outline" onClick={addNewTeamMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加成员
                  </Button>
                </div>

                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {form.watch(`teamMembers.${index}.name`)?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          placeholder="成员姓名"
                          {...form.register(`teamMembers.${index}.name`)}
                        />
                        <Input
                          placeholder="角色/职位（可选）"
                          {...form.register(`teamMembers.${index}.role`)}
                        />
                      </div>
                      
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-3 pt-6">
                <Link href="/">
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </Link>
                <Button type="submit" disabled={isCreatingProject}>
                  {isCreatingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  提交项目
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
