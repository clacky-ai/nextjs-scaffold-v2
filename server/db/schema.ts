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
  decimal,
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 项目表
export const projects = pgTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  demoUrl: varchar("demo_url", { length: 500 }),
  repositoryUrl: varchar("repository_url", { length: 500 }),
  presentationUrl: varchar("presentation_url", { length: 500 }),
  categoryId: varchar("category_id", { length: 255 }).references(() => categories.id),
  submitterId: varchar("submitter_id", { length: 255 }).notNull().references(() => users.id),
  teamMembers: jsonb("team_members").$type<string[]>().default([]), // 团队成员ID数组
  tags: jsonb("tags").$type<string[]>().default([]), // 标签数组
  attachments: jsonb("attachments").$type<{filename: string, url: string, size: number}[]>().default([]), // 附件信息
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, submitted, published
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("projects_title_idx").on(table.title),
  categoryIdx: index("projects_category_idx").on(table.categoryId),
  submitterIdx: index("projects_submitter_idx").on(table.submitterId),
  statusIdx: index("projects_status_idx").on(table.status),
}));

// 投票表
export const votes = pgTable("votes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  voterId: varchar("voter_id", { length: 255 }).notNull().references(() => users.id),
  projectId: varchar("project_id", { length: 255 }).notNull().references(() => projects.id),
  comment: text("comment").notNull(), // 强制性评价
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  voterProjectUnique: unique("votes_voter_project_unique").on(table.voterId, table.projectId),
  voterIdx: index("votes_voter_idx").on(table.voterId),
  projectIdx: index("votes_project_idx").on(table.projectId),
}));

// 评分维度表
export const scoreDimensions = pgTable("score_dimensions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  maxScore: integer("max_score").default(10).notNull(),
  weight: decimal("weight", { precision: 3, scale: 2 }).default("1.00").notNull(), // 权重
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 评分表
export const scores = pgTable("scores", {
  id: varchar("id", { length: 255 }).primaryKey(),
  voteId: varchar("vote_id", { length: 255 }).notNull().references(() => votes.id, { onDelete: "cascade" }),
  dimensionId: varchar("dimension_id", { length: 255 }).notNull().references(() => scoreDimensions.id),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  voteIdDimensionIdPk: unique("scores_vote_dimension_unique").on(table.voteId, table.dimensionId),
  voteIdx: index("scores_vote_idx").on(table.voteId),
  dimensionIdx: index("scores_dimension_idx").on(table.dimensionId),
}));

// 投票会话表 - 管理投票活动
export const votingSessions = pgTable("voting_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxVotesPerUser: integer("max_votes_per_user").default(3).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  allowSelfVoting: boolean("allow_self_voting").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export type ScoreDimension = typeof scoreDimensions.$inferSelect;
export type InsertScoreDimension = typeof scoreDimensions.$inferInsert;

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

export type VotingSession = typeof votingSessions.$inferSelect;
export type InsertVotingSession = typeof votingSessions.$inferInsert;

// 表关系定义
export const usersRelations = relations(users, ({ many }) => ({
  submittedProjects: many(projects, { relationName: "submitter" }),
  votes: many(votes),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(categories, {
    fields: [projects.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [projects.submitterId],
    references: [users.id],
    relationName: "submitter",
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one, many }) => ({
  voter: one(users, {
    fields: [votes.voterId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [votes.projectId],
    references: [projects.id],
  }),
  scores: many(scores),
}));

export const scoreDimensionsRelations = relations(scoreDimensions, ({ many }) => ({
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  vote: one(votes, {
    fields: [scores.voteId],
    references: [votes.id],
  }),
  dimension: one(scoreDimensions, {
    fields: [scores.dimensionId],
    references: [scoreDimensions.id],
  }),
}));