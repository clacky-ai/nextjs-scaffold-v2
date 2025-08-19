import {
  users,
  projects,
  categories,
  votes,
  userVoteStats,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Category,
  type InsertCategory,
  type Vote,
  type InsertVote,
  type UserVoteStats,
} from "server/db/schema";
import { db } from "./db/index";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Vote operations
  getVote(userId: string, projectId: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  getProjectVotes(projectId: string): Promise<Vote[]>;
  getUserVotes(userId: string): Promise<Vote[]>;

  // Vote stats operations
  getUserVoteStats(userId: string): Promise<UserVoteStats | undefined>;
  updateUserVoteStats(userId: string, votesUsed: number): Promise<UserVoteStats>;
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

  // Project operations
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.submittedAt));
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
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Vote operations
  async getVote(userId: string, projectId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.projectId, projectId)));
    return vote;
  }

  async createVote(voteData: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(voteData).returning();
    return vote;
  }

  async getProjectVotes(projectId: string): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.projectId, projectId));
  }

  async getUserVotes(userId: string): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.userId, userId));
  }

  // Vote stats operations
  async getUserVoteStats(userId: string): Promise<UserVoteStats | undefined> {
    const [stats] = await db.select().from(userVoteStats).where(eq(userVoteStats.userId, userId));
    return stats;
  }

  async updateUserVoteStats(userId: string, votesUsed: number): Promise<UserVoteStats> {
    const [stats] = await db
      .insert(userVoteStats)
      .values({
        userId,
        votesUsed,
        lastVoteAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userVoteStats.userId,
        set: {
          votesUsed,
          lastVoteAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return stats;
  }

  // // Portfolio company operations
  // async getPortfolioCompanies(): Promise<PortfolioCompany[]> {
  //   return db.select().from(portfolioCompanies).orderBy(desc(portfolioCompanies.investmentYear));
  // }

  // async getPortfolioCompany(id: string): Promise<PortfolioCompany | undefined> {
  //   const [company] = await db.select().from(portfolioCompanies).where(eq(portfolioCompanies.id, id));
  //   return company;
  // }

  // async createPortfolioCompany(company: InsertPortfolioCompany): Promise<PortfolioCompany> {
  //   const [newCompany] = await db.insert(portfolioCompanies).values(company).returning();
  //   return newCompany;
  // }

  // async updatePortfolioCompany(id: string, company: Partial<InsertPortfolioCompany>): Promise<PortfolioCompany> {
  //   const [updatedCompany] = await db
  //     .update(portfolioCompanies)
  //     .set({ ...company, updatedAt: new Date() })
  //     .where(eq(portfolioCompanies.id, id))
  //     .returning();
  //   return updatedCompany;
  // }

  // async deletePortfolioCompany(id: string): Promise<void> {
  //   await db.delete(portfolioCompanies).where(eq(portfolioCompanies.id, id));
  // }

  // // Team member operations
  // async getTeamMembers(): Promise<TeamMember[]> {
  //   return db.select().from(teamMembers).orderBy(teamMembers.displayOrder);
  // }

  // async getTeamMember(id: string): Promise<TeamMember | undefined> {
  //   const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
  //   return member;
  // }

  // async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
  //   const [newMember] = await db.insert(teamMembers).values(member).returning();
  //   return newMember;
  // }

  // async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember> {
  //   const [updatedMember] = await db
  //     .update(teamMembers)
  //     .set({ ...member, updatedAt: new Date() })
  //     .where(eq(teamMembers.id, id))
  //     .returning();
  //   return updatedMember;
  // }

  // async deleteTeamMember(id: string): Promise<void> {
  //   await db.delete(teamMembers).where(eq(teamMembers.id, id));
  // }

  // // Contact submission operations
  // async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
  //   const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
  //   return newSubmission;
  // }

  // async getContactSubmissions(): Promise<ContactSubmission[]> {
  //   return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  // }
}

export const storage = new DatabaseStorage();
