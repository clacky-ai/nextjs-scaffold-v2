import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm'

// 用户表 - 支持实名制注册
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  realName: varchar("real_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  organization: varchar("organization", { length: 255 }),
  department: varchar("department", { length: 255 }),
  position: varchar("position", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
}));

// 项目分类表
export const categories = pgTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3B82F6"), // 十六进制颜色
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 项目表
export const projects = pgTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id", { length: 255 }).references(() => categories.id),
  submitterId: varchar("submitter_id", { length: 255 }).references(() => users.id).notNull(),
  demoUrl: varchar("demo_url", { length: 500 }),
  repositoryUrl: varchar("repository_url", { length: 500 }),
  presentationUrl: varchar("presentation_url", { length: 500 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  teamMembers: jsonb("team_members").$type<{id: string, name: string, role?: string}[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  submitterIdx: index("projects_submitter_idx").on(table.submitterId),
  categoryIdx: index("projects_category_idx").on(table.categoryId),
}));

// 投票表 - 记录用户对项目的投票
export const votes = pgTable("votes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  projectId: varchar("project_id", { length: 255 }).references(() => projects.id).notNull(),
  // 五个评分维度 (1-10分)
  innovationScore: integer("innovation_score").notNull(), // 创新性
  technicalScore: integer("technical_score").notNull(), // 技术实现
  practicalityScore: integer("practicality_score").notNull(), // 实用性
  presentationScore: integer("presentation_score").notNull(), // 展示效果
  teamworkScore: integer("teamwork_score").notNull(), // 团队协作
  // 总分 (自动计算)
  totalScore: integer("total_score").notNull(),
  // 投票理由 (强制性)
  comment: text("comment").notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
}, (table) => ({
  userProjectUnique: unique("votes_user_project_unique").on(table.userId, table.projectId),
  userIdx: index("votes_user_idx").on(table.userId),
  projectIdx: index("votes_project_idx").on(table.projectId),
}));

// 用户投票统计表 - 跟踪每个用户的投票次数
export const userVoteStats = pgTable("user_vote_stats", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id).primaryKey(),
  votesUsed: integer("votes_used").default(0).notNull(),
  maxVotes: integer("max_votes").default(3).notNull(),
  lastVoteAt: timestamp("last_vote_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 项目文件表 - 存储项目相关文件
export const projectFiles = pgTable("project_files", {
  id: varchar("id", { length: 255 }).primaryKey(),
  projectId: varchar("project_id", { length: 255 }).references(() => projects.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("project_files_project_idx").on(table.projectId),
}));

// 会话表 - 用于用户会话管理
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});


// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type UserVoteStats = typeof userVoteStats.$inferSelect;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = typeof projectFiles.$inferInsert;