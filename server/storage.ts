import {
  users,
  categories,
  projects,
  votes,
  scores,
  scoreDimensions,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Project,
  type InsertProject,
  type Vote,
  type InsertVote,
  type Score,
  type InsertScore,
  type ScoreDimension,
} from "./db/schema";
import { db } from "./db/index";
import { eq, desc, and, like, count, sql, avg, sum } from "drizzle-orm";
import { nanoid } from "nanoid";

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    }
    catch(err) {
      console.log(err);
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  // Project operations
  async getProjects(query: ProjectsQuery): Promise<ProjectsResult> {
    const { page = 1, limit = 10, categoryId, status, search } = query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [eq(projects.isActive, true)];

    if (categoryId) {
      conditions.push(eq(projects.categoryId, categoryId));
    }

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    if (search) {
      conditions.push(
        sql`(${projects.title} ILIKE ${`%${search}%`} OR ${projects.description} ILIKE ${`%${search}%`})`
      );
    }

    // 获取总数
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(projects)
      .where(and(...conditions));

    // 获取项目列表
    const projectList = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      projects: projectList,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    };
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.update(projects).set({ isActive: false }).where(eq(projects.id, id));
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.submitterId, userId), eq(projects.isActive, true)))
      .orderBy(desc(projects.createdAt));
  }

  // Score Dimension operations
  async getScoreDimensions(): Promise<ScoreDimension[]> {
    return await db
      .select()
      .from(scoreDimensions)
      .where(eq(scoreDimensions.isActive, true))
      .orderBy(scoreDimensions.sortOrder);
  }

  // Vote operations
  async getUserVoteStats(userId: string): Promise<VoteStats> {
    const [{ count: totalVotes }] = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.voterId, userId));

    const maxVotes = 3; // 从配置或数据库获取
    const remainingVotes = Math.max(0, maxVotes - Number(totalVotes));

    return {
      totalVotes: Number(totalVotes),
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
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.voterId, userId), eq(votes.projectId, projectId)));

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
    return await db.transaction(async (tx) => {
      // 创建投票记录
      const [vote] = await tx.insert(votes).values(voteData).returning();

      // 创建评分记录
      const scoreInserts = scoreData.map(({ dimensionId, score }) => ({
        id: nanoid(),
        voteId: vote.id,
        dimensionId,
        score,
      }));

      const insertedScores = await tx.insert(scores).values(scoreInserts).returning();

      return {
        vote,
        scores: insertedScores,
      };
    });
  }

  async getProjectVotes(projectId: string): Promise<VoteWithScores[]> {
    const projectVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.projectId, projectId))
      .orderBy(desc(votes.createdAt));

    const result: VoteWithScores[] = [];

    for (const vote of projectVotes) {
      const voteScores = await db
        .select()
        .from(scores)
        .where(eq(scores.voteId, vote.id));

      result.push({
        vote,
        scores: voteScores,
      });
    }

    return result;
  }

  async getUserVotes(userId: string): Promise<VoteWithScores[]> {
    const userVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.voterId, userId))
      .orderBy(desc(votes.createdAt));

    const result: VoteWithScores[] = [];

    for (const vote of userVotes) {
      const voteScores = await db
        .select()
        .from(scores)
        .where(eq(scores.voteId, vote.id));

      result.push({
        vote,
        scores: voteScores,
      });
    }

    return result;
  }

  async getVotingResults(): Promise<VotingResults> {
    // 获取所有已发布的项目
    const publishedProjects = await db
      .select()
      .from(projects)
      .where(and(eq(projects.status, 'published'), eq(projects.isActive, true)));

    const results = [];
    let totalVotes = 0;

    for (const project of publishedProjects) {
      // 获取项目的投票数
      const [{ count: voteCount }] = await db
        .select({ count: count() })
        .from(votes)
        .where(eq(votes.projectId, project.id));

      const projectVoteCount = Number(voteCount);
      totalVotes += projectVoteCount;

      // 获取各维度平均分
      const dimensionScores = await db
        .select({
          dimensionId: scores.dimensionId,
          avgScore: avg(scores.score),
        })
        .from(scores)
        .innerJoin(votes, eq(scores.voteId, votes.id))
        .where(eq(votes.projectId, project.id))
        .groupBy(scores.dimensionId);

      const averageScores: Record<string, number> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      // 获取维度权重并计算加权平均分
      const dimensions = await this.getScoreDimensions();

      for (const dimension of dimensions) {
        const dimScore = dimensionScores.find(s => s.dimensionId === dimension.id);
        const avgScore = dimScore ? Number(dimScore.avgScore) : 0;
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
}

export const storage = new DatabaseStorage();
