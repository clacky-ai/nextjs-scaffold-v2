"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/stores/user";

interface ProjectSubmissionFormProps {
  userId: string;
}

export function ProjectSubmissionForm({ userId }: ProjectSubmissionFormProps) {
  const { submitProject, loading } = useProjectStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamMembers: "",
    demoLink: "",
    category: "",
    tags: "",
  });

  const isLoading = loading.submitProject;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 处理团队成员（假设以逗号分隔的用户ID）
    const teamMemberIds = formData.teamMembers
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    // 处理标签
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const success = await submitProject({
      title: formData.title,
      description: formData.description,
      teamMembers: teamMemberIds,
      demoLink: formData.demoLink,
      category: formData.category,
      tags: tags,
    });

    if (success) {
      setFormData({
        title: "",
        description: "",
        teamMembers: "",
        demoLink: "",
        category: "",
        tags: "",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">项目标题 *</Label>
        <Input
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          placeholder="请输入项目标题"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">项目描述 *</Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleInputChange}
          placeholder="请详细描述您的项目..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamMembers">团队成员 *</Label>
        <Input
          id="teamMembers"
          name="teamMembers"
          required
          value={formData.teamMembers}
          onChange={handleInputChange}
          placeholder="请输入团队成员用户ID，用逗号分隔"
        />
        <p className="text-sm text-gray-500">
          请输入团队成员的用户ID，用逗号分隔（包括您自己）
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="demoLink">演示链接</Label>
        <Input
          id="demoLink"
          name="demoLink"
          type="url"
          value={formData.demoLink}
          onChange={handleInputChange}
          placeholder="https://example.com/demo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">项目分类</Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="如：Web应用、移动应用、AI工具等"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">标签</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="请输入标签，用逗号分隔"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "提交中..." : "提交项目"}
      </Button>
    </form>
  );
}
