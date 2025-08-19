import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateToken,
  optionalAuth,
  type AuthenticatedRequest
} from "./auth";
import { registerUserSchema, insertProjectSchema, insertVoteSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

// 登录请求schema
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // 用户注册
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      // 检查邮箱是否已存在
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "该邮箱已被注册" });
      }

      // 加密密码
      const hashedPassword = await hashPassword(validatedData.password);

      // 创建用户
      const user = await storage.createUser({
        id: nanoid(),
        email: validatedData.email,
        password: hashedPassword,
        realName: validatedData.realName,
        phone: validatedData.phone || null,
        organization: validatedData.organization || null,
        department: validatedData.department || null,
        position: validatedData.position || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 生成token
      const token = generateToken({
        id: user.id,
        email: user.email,
        realName: user.realName,
      });

      res.status(201).json({
        message: "注册成功",
        token,
        user: {
          id: user.id,
          email: user.email,
          realName: user.realName,
          organization: user.organization,
          department: user.department,
          position: user.position,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "输入数据验证失败",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "注册失败，请稍后重试" });
    }
  });

  // 用户登录
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // 查找用户
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "邮箱或密码错误" });
      }

      // 检查用户是否活跃
      if (!user.isActive) {
        return res.status(401).json({ message: "账户已被禁用，请联系管理员" });
      }

      // 验证密码
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "邮箱或密码错误" });
      }

      // 生成token
      const token = generateToken({
        id: user.id,
        email: user.email,
        realName: user.realName,
      });

      res.json({
        message: "登录成功",
        token,
        user: {
          id: user.id,
          email: user.email,
          realName: user.realName,
          organization: user.organization,
          department: user.department,
          position: user.position,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "输入数据验证失败",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "登录失败，请稍后重试" });
    }
  });

  // 获取当前用户信息
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "用户不存在" });
      }

      res.json({
        id: user.id,
        email: user.email,
        realName: user.realName,
        organization: user.organization,
        department: user.department,
        position: user.position,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "获取用户信息失败" });
    }
  });

  // 分类管理API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "获取分类失败" });
    }
  });

  // 初始化默认分类（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/init-categories', async (req, res) => {
      try {
        const defaultCategories = [
          { id: nanoid(), name: "人工智能", description: "AI、机器学习、深度学习相关项目", color: "#3B82F6" },
          { id: nanoid(), name: "物联网", description: "IoT、传感器、智能硬件项目", color: "#10B981" },
          { id: nanoid(), name: "区块链", description: "区块链、加密货币、去中心化应用", color: "#8B5CF6" },
          { id: nanoid(), name: "移动应用", description: "手机APP、移动端应用开发", color: "#F59E0B" },
          { id: nanoid(), name: "Web应用", description: "网站、Web应用、前端项目", color: "#EF4444" },
          { id: nanoid(), name: "数据科学", description: "数据分析、可视化、大数据项目", color: "#06B6D4" },
        ];

        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }

        res.json({ message: "默认分类创建成功", categories: defaultCategories });
      } catch (error) {
        console.error("Init categories error:", error);
        res.status(500).json({ message: "创建默认分类失败" });
      }
    });
  }

  // 项目管理API
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "获取项目列表失败" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "项目不存在" });
      }
      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "获取项目详情失败" });
    }
  });

  app.post('/api/projects', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // const validatedData = insertProjectSchema.parse(req.body);
      const validatedData = {...req.body}

      const project = await storage.createProject({
        ...validatedData,
        id: nanoid(),
        submitterId: req.user!.id,
      });

      res.status(201).json({
        message: "项目提交成功",
        project,
      });
    } catch (error) {
      console.error("Create project error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "输入数据验证失败",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "项目提交失败" });
    }
  });

  // 投票相关API

  // 获取用户投票统计
  app.get('/api/votes/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getUserVoteStats(req.user!.id);
      res.json(stats || { userId: req.user!.id, votesUsed: 0, maxVotes: 3 });
    } catch (error) {
      console.error("Get vote stats error:", error);
      res.status(500).json({ message: "获取投票统计失败" });
    }
  });

  // 检查用户是否已对项目投票
  app.get('/api/votes/:projectId/check', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const vote = await storage.getVote(req.user!.id, req.params.projectId);
      res.json({ hasVoted: !!vote, vote });
    } catch (error) {
      console.error("Check vote error:", error);
      res.status(500).json({ message: "检查投票状态失败" });
    }
  });

  // 提交投票
  app.post('/api/votes', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      const userId = req.user!.id;
      const { projectId } = validatedData;

      // 检查是否已投票
      const existingVote = await storage.getVote(userId, projectId);
      if (existingVote) {
        return res.status(400).json({ message: "您已经为该项目投过票了" });
      }

      // 检查投票次数限制
      const stats = await storage.getUserVoteStats(userId);
      const votesUsed = stats?.votesUsed || 0;
      if (votesUsed >= 3) {
        return res.status(400).json({ message: "您的投票次数已用完（最多3票）" });
      }

      // 检查是否为自己的项目（防自投）
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "项目不存在" });
      }

      // 检查是否是项目提交者
      if (project.submitterId === userId) {
        return res.status(400).json({ message: "不能为自己的项目投票" });
      }

      // 检查是否是团队成员
      const isTeamMember = project.teamMembers?.some(member => member.id === userId) || false;
      if (isTeamMember) {
        return res.status(400).json({ message: "不能为自己参与的项目投票" });
      }

      // 计算总分
      const totalScore = validatedData.innovationScore +
                        validatedData.technicalScore +
                        validatedData.practicalityScore +
                        validatedData.presentationScore +
                        validatedData.teamworkScore;

      // 创建投票
      const vote = await storage.createVote({
        ...validatedData,
        id: nanoid(),
        userId,
        totalScore,
      });

      // 更新用户投票统计
      await storage.updateUserVoteStats(userId, votesUsed + 1);

      res.status(201).json({
        message: "投票成功",
        vote,
      });
    } catch (error) {
      console.error("Create vote error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "输入数据验证失败",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "投票失败" });
    }
  });

  // 获取项目的投票结果
  app.get('/api/projects/:id/votes', async (req, res) => {
    try {
      const votes = await storage.getProjectVotes(req.params.id);

      // 计算统计信息
      const totalVotes = votes.length;
      const averageScores = {
        innovation: votes.reduce((sum, v) => sum + v.innovationScore, 0) / totalVotes || 0,
        technical: votes.reduce((sum, v) => sum + v.technicalScore, 0) / totalVotes || 0,
        practicality: votes.reduce((sum, v) => sum + v.practicalityScore, 0) / totalVotes || 0,
        presentation: votes.reduce((sum, v) => sum + v.presentationScore, 0) / totalVotes || 0,
        teamwork: votes.reduce((sum, v) => sum + v.teamworkScore, 0) / totalVotes || 0,
        total: votes.reduce((sum, v) => sum + v.totalScore, 0) / totalVotes || 0,
      };

      res.json({
        totalVotes,
        averageScores,
        votes: votes.map(vote => ({
          id: vote.id,
          comment: vote.comment,
          votedAt: vote.votedAt,
          scores: {
            innovation: vote.innovationScore,
            technical: vote.technicalScore,
            practicality: vote.practicalityScore,
            presentation: vote.presentationScore,
            teamwork: vote.teamworkScore,
            total: vote.totalScore,
          }
        }))
      });
    } catch (error) {
      console.error("Get project votes error:", error);
      res.status(500).json({ message: "获取投票结果失败" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
