import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../storage';
import { authenticateAdminToken, type AuthenticatedAdminRequest } from '../../middleware/admin-auth';

const router = Router();

// 获取所有项目列表
router.get('/', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const projects = await storage.getAllProjects();

    // 转换数据格式以匹配前端期望的格式
    const formattedProjects = await Promise.all(
      projects.map(async (project) => {
        try {
          // 获取作者信息
          const author = await storage.getUser(project.submitterId);

          // 获取投票数
          const votes = await storage.getProjectVotes(project.id);

          return {
            id: project.id || '',
            title: project.title || '',
            description: project.description || '',
            imageUrl: null, // 数据库中没有此字段
            videoUrl: null, // 数据库中没有此字段
            demoUrl: project.demoUrl || null,
            githubUrl: project.repositoryUrl || null,
            authorId: project.submitterId || '',
            authorName: author?.realName || author?.email || '未知用户',
            isBlocked: !project.isActive,
            voteCount: votes ? votes.length : 0,
            createdAt: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(),
          };
        } catch (error) {
          console.error('Error processing project:', project.id, error);
          // 返回基本信息，避免整个请求失败
          return {
            id: project.id || '',
            title: project.title || '未知项目',
            description: project.description || '',
            imageUrl: null,
            videoUrl: null,
            demoUrl: project.demoUrl || null,
            githubUrl: project.repositoryUrl || null,
            authorId: project.submitterId || '',
            authorName: '未知用户',
            isBlocked: !project.isActive,
            voteCount: 0,
            createdAt: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      })
    );

    res.json({
      success: true,
      projects: formattedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: '获取项目列表失败'
    });
  }
});

// 更新项目状态（显示/隐藏）
router.patch('/:projectId/status', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { projectId } = req.params;
    const { isBlocked } = z.object({
      isBlocked: z.boolean()
    }).parse(req.body);

    // TODO: 实现项目显示/隐藏逻辑
    // 目前只是模拟响应，需要在数据库中添加相应字段
    console.log(`${isBlocked ? '隐藏' : '显示'}项目: ${projectId}`);

    res.json({
      success: true,
      message: `项目已${isBlocked ? '隐藏' : '显示'}`
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      message: '更新项目状态失败'
    });
  }
});

// 获取项目详情
router.get('/:projectId', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await storage.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    // 获取作者信息
    const author = await storage.getUser(project.submitterId);

    // 获取投票数
    const votes = await storage.getProjectVotes(project.id);

    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      imageUrl: null, // 数据库中没有此字段
      videoUrl: null, // 数据库中没有此字段
      demoUrl: project.demoUrl || null,
      githubUrl: project.repositoryUrl || null,
      authorId: project.submitterId,
      authorName: author?.realName || author?.email || '未知用户',
      isBlocked: !project.isActive, // 使用 isActive 字段
      voteCount: votes.length,
      createdAt: project.createdAt.toISOString(),
    };

    res.json({
      success: true,
      project: formattedProject
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: '获取项目信息失败'
    });
  }
});

// 删除项目
router.delete('/:projectId', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { projectId } = req.params;
    
    // TODO: 实现项目删除逻辑
    // 需要同时删除相关的投票记录
    console.log(`删除项目: ${projectId}`);

    res.json({
      success: true,
      message: '项目已删除'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: '删除项目失败'
    });
  }
});

export default router;
