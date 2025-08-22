import { Router } from 'express';
import { storage } from '../../storage';
import { AuthRequest } from 'server/middleware/route-auth';

const router = Router();

// 获取所有投票记录
router.get('/', async (req: AuthRequest, res) => {
  try {
    const votes = await storage.getAllVotes();
    
    // 转换数据格式以匹配前端期望的格式
    const formattedVotes = await Promise.all(
      votes.map(async (vote) => {
        // 获取用户信息
        const user = await storage.getUser(vote.userId);
        
        // 获取项目信息
        const project = await storage.getProject(vote.projectId);
        
        return {
          id: vote.id,
          userId: vote.userId,
          projectId: vote.projectId,
          reason: vote.reason || '',
          userName: user?.realName || user?.email || '未知用户',
          projectTitle: project?.title || '未知项目',
          createdAt: vote.createdAt.toISOString(),
        };
      })
    );

    res.json({
      success: true,
      votes: formattedVotes
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({
      success: false,
      message: '获取投票记录失败'
    });
  }
});

// 删除投票记录
router.delete('/:voteId', async (req: AuthRequest, res) => {
  try {
    const { voteId } = req.params;
    
    // 检查投票记录是否存在
    const vote = await storage.getVote(voteId);
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: '投票记录不存在'
      });
    }

    // 删除投票记录
    await storage.deleteVote(voteId);

    res.json({
      success: true,
      message: '投票记录已删除'
    });
  } catch (error) {
    console.error('Error deleting vote:', error);
    res.status(500).json({
      success: false,
      message: '删除投票记录失败'
    });
  }
});

// 获取投票统计信息
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const votes = await storage.getAllVotes();
    
    // 计算统计信息
    const total = votes.length;
    
    // 计算今日投票数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVotes = votes.filter(vote => {
      const voteDate = new Date(vote.createdAt);
      voteDate.setHours(0, 0, 0, 0);
      return voteDate.getTime() === today.getTime();
    }).length;
    
    // 计算每个项目的平均投票数
    const projectVoteCounts = votes.reduce((acc, vote) => {
      acc[vote.projectId] = (acc[vote.projectId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const projectCount = Object.keys(projectVoteCounts).length;
    const averageVotesPerProject = projectCount > 0 ? total / projectCount : 0;

    res.json({
      success: true,
      stats: {
        total,
        todayVotes,
        averageVotesPerProject: Math.round(averageVotesPerProject * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching vote stats:', error);
    res.status(500).json({
      success: false,
      message: '获取投票统计失败'
    });
  }
});

// 获取特定项目的投票记录
router.get('/project/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const votes = await storage.getProjectVotes(projectId);
    
    // 转换数据格式
    const formattedVotes = await Promise.all(
      votes.map(async (voteWithScores) => {
        const vote = voteWithScores.vote;
        const user = await storage.getUser(vote.voterId);
        const project = await storage.getProject(vote.projectId);

        return {
          id: vote.id,
          userId: vote.voterId,
          projectId: vote.projectId,
          reason: vote.comment || '',
          userName: user?.realName || user?.email || '未知用户',
          projectTitle: project?.title || '未知项目',
          createdAt: vote.createdAt.toISOString(),
        };
      })
    );

    res.json({
      success: true,
      votes: formattedVotes
    });
  } catch (error) {
    console.error('Error fetching project votes:', error);
    res.status(500).json({
      success: false,
      message: '获取项目投票记录失败'
    });
  }
});

// 获取特定用户的投票记录
router.get('/user/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const votes = await storage.getVotesForUser(userId);
    
    // 转换数据格式
    const formattedVotes = await Promise.all(
      votes.map(async (vote) => {
        const user = await storage.getUser(vote.userId);
        const project = await storage.getProject(vote.projectId);
        
        return {
          id: vote.id,
          userId: vote.userId,
          projectId: vote.projectId,
          reason: vote.reason || '',
          userName: user?.realName || user?.email || '未知用户',
          projectTitle: project?.title || '未知项目',
          createdAt: vote.createdAt.toISOString(),
        };
      })
    );

    res.json({
      success: true,
      votes: formattedVotes
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({
      success: false,
      message: '获取用户投票记录失败'
    });
  }
});

export default router;
