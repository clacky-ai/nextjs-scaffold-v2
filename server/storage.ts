import { db } from './db/index';
import { nanoid } from 'nanoid';
import type { User, AdminUser, Prisma } from '@prisma/client';

// Type aliases for insert operations
type InsertUser = Prisma.UserCreateInput;
type InsertAdminUser = Prisma.AdminUserCreateInput;


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
      data: {
        ...userData,
        updatedAt: new Date()
      }
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
      data: {
        ...userData,
        updatedAt: new Date()
      }
    });
    return adminUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const storage = new DatabaseStorage();
