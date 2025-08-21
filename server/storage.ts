import {
  users,
  adminUsers,
  type User,
  type InsertUser,
  type AdminUser,
  type InsertAdminUser,
} from "./db/schema";
import { db } from "./db/index";
import { eq, desc, and, like, count, sql, avg, sum } from "drizzle-orm";
import { nanoid } from "nanoid";


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

  // Admin User operations
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return adminUser;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    try {
      const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
      return adminUser;
    } catch (err) {
      console.log(err);
    }
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    try {
      const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
      return adminUser;
    } catch (err) {
      console.log(err);
    }
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const [adminUser] = await db.insert(adminUsers).values(userData).returning();
    return adminUser;
  }

  async updateAdminUser(id: string, userData: Partial<InsertAdminUser>): Promise<AdminUser> {
    const [adminUser] = await db
      .update(adminUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return adminUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
