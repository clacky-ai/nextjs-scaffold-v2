import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { storage } from '../storage';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 项目创建/更新schema
const projectSchema = z.object({
  title: z.string().min(1, "项目标题不能为空").max(200, "标题不能超过200个字符"),
  description: z.string().min(10, "项目描述至少需要10个字符").max(2000, "描述不能超过2000个字符"),
  demoUrl: z.string().url("请输入有效的演示链接").optional().or(z.literal('')),
  repositoryUrl: z.string().url("请输入有效的代码仓库链接").optional().or(z.literal('')),
  presentationUrl: z.string().url("请输入有效的文档链接").optional().or(z.literal('')),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  teamMembers: z.array(z.string()).optional(),
});

// 获取项目列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await storage.getProjects({
      page,
      limit,
      categoryId: category,
      status,
      search,
    });

    res.json(result);
  } catch (error) {
    console.error('获取项目列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    res.json({ project });
  } catch (error) {
    console.error('获取项目详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 创建项目
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const validatedData = projectSchema.parse(req.body);
    
    const newProject = await storage.createProject({
      id: nanoid(),
      title: validatedData.title,
      description: validatedData.description,
      demoUrl: validatedData.demoUrl || null,
      repositoryUrl: validatedData.repositoryUrl || null,
      presentationUrl: validatedData.presentationUrl || null,
      categoryId: validatedData.categoryId || null,
      tags: validatedData.tags || [],
      teamMembers: validatedData.teamMembers || [],
      submitterId: req.user.id,
      status: 'submitted',
    });

    res.status(201).json({
      message: '项目创建成功',
      project: newProject
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('创建项目错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新项目
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const { id } = req.params;
    
    // 检查项目是否存在
    const existingProject = await storage.getProject(id);
    if (!existingProject) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限（只有项目提交者可以编辑）
    if (existingProject.submitterId !== req.user.id) {
      return res.status(403).json({ message: '无权限编辑此项目' });
    }

    const validatedData = projectSchema.partial().parse(req.body);
    
    const updatedProject = await storage.updateProject(id, {
      ...validatedData,
      demoUrl: validatedData.demoUrl || null,
      repositoryUrl: validatedData.repositoryUrl || null,
      presentationUrl: validatedData.presentationUrl || null,
      categoryId: validatedData.categoryId || null,
    });

    res.json({
      message: '项目更新成功',
      project: updatedProject
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('更新项目错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除项目
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const { id } = req.params;
    
    // 检查项目是否存在
    const existingProject = await storage.getProject(id);
    if (!existingProject) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限（只有项目提交者可以删除）
    if (existingProject.submitterId !== req.user.id) {
      return res.status(403).json({ message: '无权限删除此项目' });
    }

    await storage.deleteProject(id);

    res.json({ message: '项目删除成功' });
  } catch (error) {
    console.error('删除项目错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 检查是否可以为项目投票
router.get('/:id/can-vote', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const { id } = req.params;
    
    const result = await storage.canUserVoteForProject(req.user.id, id);
    res.json(result);
  } catch (error) {
    console.error('检查投票权限错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取项目的投票结果
router.get('/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const votes = await storage.getProjectVotes(id);
    res.json({ votes });
  } catch (error) {
    console.error('获取项目投票结果错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
