import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjectStore } from '@/stores/users/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, ArrowLeft, Plus, X } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';

// 项目表单验证
const projectSchema = z.object({
  title: z.string().min(1, '项目标题不能为空').max(200, '标题不能超过200个字符'),
  description: z.string().min(10, '项目描述至少需要10个字符').max(2000, '描述不能超过2000个字符'),
  demoUrl: z.string().url('请输入有效的演示链接').optional().or(z.literal('')),
  repositoryUrl: z.string().url('请输入有效的代码仓库链接').optional().or(z.literal('')),
  presentationUrl: z.string().url('请输入有效的文档链接').optional().or(z.literal('')),
  categoryId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectFormPage() {
  const [location, navigate] = useLocation();
  const isEdit = location.includes('/edit');
  const projectId = isEdit ? location.split('/').pop() : null;

  const {
    categories,
    currentProject,
    isLoading,
    error,
    fetchCategories,
    fetchProject,
    createProject,
    updateProject,
    clearError,
  } = useProjectStore();

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      demoUrl: '',
      repositoryUrl: '',
      presentationUrl: '',
      categoryId: '',
    },
  });

  useEffect(() => {
    fetchCategories();
    
    if (isEdit && projectId) {
      fetchProject(projectId);
    }
  }, [fetchCategories, fetchProject, isEdit, projectId]);

  useEffect(() => {
    if (currentProject && isEdit) {
      form.reset({
        title: currentProject.title,
        description: currentProject.description,
        demoUrl: currentProject.demoUrl || '',
        repositoryUrl: currentProject.repositoryUrl || '',
        presentationUrl: currentProject.presentationUrl || '',
        categoryId: currentProject.categoryId || '',
      });
      setTags(currentProject.tags || []);
      setTeamMembers(currentProject.teamMembers || []);
    }
  }, [currentProject, isEdit, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      clearError();
      
      const projectData = {
        ...data,
        tags,
        teamMembers,
        // 清理空字符串
        demoUrl: data.demoUrl || undefined,
        repositoryUrl: data.repositoryUrl || undefined,
        presentationUrl: data.presentationUrl || undefined,
        categoryId: data.categoryId || undefined,
      };

      if (isEdit && projectId) {
        await updateProject(projectId, projectData);
      } else {
        await createProject(projectData);
      }

      navigate('/my-projects');
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addTeamMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember.trim())) {
      setTeamMembers([...teamMembers, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeTeamMember = (memberToRemove: string) => {
    setTeamMembers(teamMembers.filter(member => member !== memberToRemove));
  };

  if (isLoading && isEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载项目信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/my-projects">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? '编辑项目' : '提交新项目'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit ? '修改项目信息' : '填写项目详细信息'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription className="flex justify-between items-center">
              {error}
              <Button variant="outline" size="sm" onClick={clearError}>
                关闭
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>
              请填写完整的项目信息，带 * 的字段为必填项
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">项目标题 *</Label>
                  <Input
                    id="title"
                    placeholder="请输入项目标题"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">项目描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述您的项目，包括功能特点、技术亮点等（至少10个字符）"
                    rows={6}
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">项目分类</Label>
                  <Select
                    value={form.watch('categoryId')}
                    onValueChange={(value) => form.setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择项目分类" />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="demoUrl">演示链接</Label>
                    <Input
                      id="demoUrl"
                      type="url"
                      placeholder="https://example.com"
                      {...form.register('demoUrl')}
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
                      {...form.register('repositoryUrl')}
                    />
                    {form.formState.errors.repositoryUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.repositoryUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="presentationUrl">项目文档</Label>
                    <Input
                      id="presentationUrl"
                      type="url"
                      placeholder="https://docs.example.com"
                      {...form.register('presentationUrl')}
                    />
                    {form.formState.errors.presentationUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.presentationUrl.message}
                      </p>
                    )}
                  </div>
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
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 团队成员 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">团队成员</h3>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="添加团队成员姓名"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                  />
                  <Button type="button" onClick={addTeamMember}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {member}
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/my-projects">取消</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? '保存修改' : '提交项目'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
