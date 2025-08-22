import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { storage } from '../../storage';
import { AuthRequest } from 'server/middleware/route-auth';

const router = Router();

// 投票提交schema
const voteSchema = z.object({
  projectId: z.string().min(1, "项目ID不能为空"),
  scores: z.array(z.object({
    dimensionId: z.string().min(1, "评分维度ID不能为空"),
    score: z.number().min(1, "评分不能小于1").max(10, "评分不能大于10"),
  })).min(1, "至少需要一个评分"),
  comment: z.string().min(10, "评价至少需要10个字符").max(1000, "评价不能超过1000个字符"),
});

// 提交投票
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const validatedData = voteSchema.parse(req.body);
    
    // 检查是否可以投票
    const canVoteResult = await storage.canUserVoteForProject(req.user.id, validatedData.projectId);
    if (!canVoteResult.canVote) {
      return res.status(400).json({ 
        message: canVoteResult.reason || '无法投票' 
      });
    }

    // 创建投票记录和评分记录
    const vote = await storage.createVote({
      id: nanoid(),
      voterId: req.user.id,
      projectId: validatedData.projectId,
      comment: validatedData.comment,
    }, validatedData.scores);

    res.status(201).json({
      message: '投票提交成功',
      vote
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: error.errors 
      });
    }
    
    console.error('提交投票错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取用户投票统计
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const stats = await storage.getUserVoteStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('获取投票统计错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取用户投票历史
router.get('/my-votes', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '用户未认证' });
    }

    const votes = await storage.getUserVotes(req.user.id);
    res.json({ votes });
  } catch (error) {
    console.error('获取投票历史错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取投票结果统计
router.get('/results', async (req, res) => {
  try {
    const results = await storage.getVotingResults();
    res.json(results);
  } catch (error) {
    console.error('获取投票结果错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
