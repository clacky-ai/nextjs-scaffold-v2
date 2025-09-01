import { db } from './db/index';
import { nanoid } from 'nanoid';
import type {
  User,
  AdminUser,
  Category,
  Project,
  Vote,
  Score,
  ScoreDimension,
  Prisma
} from '@prisma/client';

// Type aliases for insert operations
type InsertUser = Prisma.UserCreateInput;
type InsertAdminUser = Prisma.AdminUserCreateInput;
type InsertCategory = Prisma.CategoryCreateInput;
type InsertProject = Prisma.ProjectUncheckedCreateInput;
type InsertVote = Prisma.VoteUncheckedCreateInput;
type InsertScore = Prisma.ScoreCreateInput;

interface ProjectsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  search?: string;
}

interface ProjectsResult {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface VoteStats {
  totalVotes: number;
  remainingVotes: number;
  maxVotes: number;
}

interface CanVoteResult {
  canVote: boolean;
  reason?: string;
}

interface VoteWithScores {
  vote: Vote;
  scores: Score[];
}

interface ProjectVoteResult {
  project: Project;
  totalVotes: number;
  averageScores: Record<string, number>;
  votes: VoteWithScores[];
}

interface VotingResults {
  projects: Array<{
    project: Project;
    totalVotes: number;
    averageScore: number;
    averageScores: Record<string, number>;
    rank: number;
  }>;
  totalVotes: number;
  totalProjects: number;
}



export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Admin User operations
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, user: Partial<InsertAdminUser>): Promise<AdminUser>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;

  // Project operations
  getProjects(query: ProjectsQuery): Promise<ProjectsResult>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getUserProjects(userId: string): Promise<Project[]>;

  // Score Dimension operations
  getScoreDimensions(): Promise<ScoreDimension[]>;

  // Vote operations
  getUserVoteStats(userId: string): Promise<VoteStats>;
  canUserVoteForProject(userId: string, projectId: string): Promise<CanVoteResult>;
  createVote(vote: InsertVote, scores: Array<{dimensionId: string, score: number}>): Promise<VoteWithScores>;
  getProjectVotes(projectId: string): Promise<VoteWithScores[]>;
  getUserVotes(userId: string): Promise<VoteWithScores[]>;
  getVotingResults(): Promise<VotingResults>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await db.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await db.user.findUnique({
        where: { email }
      });
      return user || undefined;
    } catch(err) {
      console.log(err);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = await db.user.create({
      data: userData
    });
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const user = await db.user.update({
      where: { id },
      data: { ...userData, updatedAt: new Date() }
    });
    return user;
  }

  // Admin User operations
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const adminUser = await db.adminUser.findUnique({
      where: { id }
    });
    return adminUser || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    try {
      const adminUser = await db.adminUser.findUnique({
        where: { username }
      });
      return adminUser || undefined;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    try {
      const adminUser = await db.adminUser.findUnique({
        where: { email }
      });
      return adminUser || undefined;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const adminUser = await db.adminUser.create({
      data: userData
    });
    return adminUser;
  }

  async updateAdminUser(id: string, userData: Partial<InsertAdminUser>): Promise<AdminUser> {
    const adminUser = await db.adminUser.update({
      where: { id },
      data: { ...userData, updatedAt: new Date() }
    });
    return adminUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.category.findMany({
      where: { isActive: true }
    });
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const category = await db.category.findUnique({
      where: { id }
    });
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category = await db.category.create({
      data: categoryData
    });
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const category = await db.category.update({
      where: { id },
      data: { ...categoryData, updatedAt: new Date() }
    });
    return category;
  }

  // Project operations
  async getProjects(query: ProjectsQuery): Promise<ProjectsResult> {
    const { page = 1, limit = 10, categoryId, status, search } = query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 获取总数
    const total = await db.project.count({ where });

    // 获取项目列表
    const projectList = await db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    return {
      projects: projectList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProject(id: string): Promise<Project | undefined> {
    const project = await db.project.findUnique({
      where: { id }
    });
    return project || undefined;
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const project = await db.project.create({
      data: projectData
    });
    return project;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project> {
    const project = await db.project.update({
      where: { id },
      data: { ...projectData, updatedAt: new Date() }
    });
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.project.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.project.findMany({
      where: {
        submitterId: userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Score Dimension operations
  async getScoreDimensions(): Promise<ScoreDimension[]> {
    return await db.scoreDimension.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Vote operations
  async getUserVoteStats(userId: string): Promise<VoteStats> {
    const totalVotes = await db.vote.count({
      where: { voterId: userId }
    });

    const maxVotes = 3; // 从配置或数据库获取
    const remainingVotes = Math.max(0, maxVotes - totalVotes);

    return {
      totalVotes,
      remainingVotes,
      maxVotes,
    };
  }

  async canUserVoteForProject(userId: string, projectId: string): Promise<CanVoteResult> {
    // 检查项目是否存在
    const project = await this.getProject(projectId);
    if (!project) {
      return { canVote: false, reason: '项目不存在' };
    }

    // 检查项目是否已发布
    if (project.status !== 'published') {
      return { canVote: false, reason: '项目尚未发布' };
    }

    // 检查是否是自己的项目（防自投）
    if (project.submitterId === userId) {
      return { canVote: false, reason: '不能为自己的项目投票' };
    }

    // 检查是否已经投过票
    const existingVote = await db.vote.findFirst({
      where: {
        voterId: userId,
        projectId: projectId
      }
    });

    if (existingVote) {
      return { canVote: false, reason: '您已经为此项目投过票了' };
    }

    // 检查投票数量限制
    const stats = await this.getUserVoteStats(userId);
    if (stats.remainingVotes <= 0) {
      return { canVote: false, reason: `您已达到最大投票数量限制（${stats.maxVotes}票）` };
    }

    return { canVote: true };
  }

  async createVote(voteData: InsertVote, scoreData: Array<{dimensionId: string, score: number}>): Promise<VoteWithScores> {
    // 使用事务确保数据一致性
    return await db.$transaction(async (tx) => {
      // 创建投票记录
      const vote = await tx.vote.create({
        data: voteData
      });

      // 创建评分记录
      const scoreInserts = scoreData.map(({ dimensionId, score }) => ({
        id: nanoid(),
        voteId: vote.id,
        dimensionId,
        score,
      }));

      const insertedScores = await tx.score.createMany({
        data: scoreInserts
      });

      // 获取创建的评分记录
      const scores = await tx.score.findMany({
        where: { voteId: vote.id }
      });

      return {
        vote,
        scores,
      };
    });
  }

  async getProjectVotes(projectId: string): Promise<VoteWithScores[]> {
    const projectVotes = await db.vote.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        scores: true
      }
    });

    return projectVotes.map(vote => ({
      vote: {
        id: vote.id,
        voterId: vote.voterId,
        projectId: vote.projectId,
        comment: vote.comment,
        createdAt: vote.createdAt,
        updatedAt: vote.updatedAt,
      },
      scores: vote.scores,
    }));
  }

  async getUserVotes(userId: string): Promise<VoteWithScores[]> {
    const userVotes = await db.vote.findMany({
      where: { voterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        scores: true
      }
    });

    return userVotes.map(vote => ({
      vote: {
        id: vote.id,
        voterId: vote.voterId,
        projectId: vote.projectId,
        comment: vote.comment,
        createdAt: vote.createdAt,
        updatedAt: vote.updatedAt,
      },
      scores: vote.scores,
    }));
  }

  async getVotingResults(): Promise<VotingResults> {
    // 获取所有已发布的项目
    const publishedProjects = await db.project.findMany({
      where: {
        status: 'published',
        isActive: true
      }
    });

    const results = [];
    let totalVotes = 0;

    for (const project of publishedProjects) {
      // 获取项目的投票数
      const projectVoteCount = await db.vote.count({
        where: { projectId: project.id }
      });

      totalVotes += projectVoteCount;

      // 获取各维度平均分
      const dimensionScores = await db.score.groupBy({
        by: ['dimensionId'],
        where: {
          vote: {
            projectId: project.id
          }
        },
        _avg: {
          score: true
        }
      });

      const averageScores: Record<string, number> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      // 获取维度权重并计算加权平均分
      const dimensions = await this.getScoreDimensions();

      for (const dimension of dimensions) {
        const dimScore = dimensionScores.find((s: any) => s.dimensionId === dimension.id);
        const avgScore = dimScore ? Number(dimScore._avg.score) : 0;
        const weight = Number(dimension.weight);

        averageScores[dimension.id] = avgScore;
        totalWeightedScore += avgScore * weight;
        totalWeight += weight;
      }

      const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      results.push({
        project,
        totalVotes: projectVoteCount,
        averageScore,
        averageScores,
        rank: 0, // 将在排序后设置
      });
    }

    // 按平均分排序并设置排名
    results.sort((a, b) => b.averageScore - a.averageScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return {
      projects: results,
      totalVotes,
      totalProjects: publishedProjects.length,
    };
  }

  // Admin-specific methods
  async getAllUsers(): Promise<User[]> {
    return await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllVotes(): Promise<Vote[]> {
    return await db.vote.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getVote(voteId: string): Promise<Vote | undefined> {
    const vote = await db.vote.findUnique({
      where: { id: voteId }
    });
    return vote || undefined;
  }

  async deleteVote(voteId: string): Promise<void> {
    await db.vote.delete({
      where: { id: voteId }
    });
  }
}

export const storage = new DatabaseStorage();
