import { pgTable, text, timestamp, boolean, integer, uuid, varchar, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  phone: varchar('phone', { length: 20 }),
  team: varchar('team', { length: 255 }),
  isBlocked: boolean('is_blocked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 管理员表
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 项目表
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  teamMembers: text('team_members').notNull(), // JSON string of team member IDs
  demoLink: text('demo_link'),
  category: varchar('category', { length: 100 }),
  tags: text('tags'), // JSON string of tags
  submitterId: uuid('submitter_id').notNull().references(() => users.id),
  isBlocked: boolean('is_blocked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 投票表
export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  voterId: uuid('voter_id').notNull().references(() => users.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  reason: text('reason').notNull(), // 投票理由
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // 确保每个用户对每个项目只能投一票
  uniqueVote: unique().on(table.voterId, table.projectId),
}))

// 投票系统状态表
export const votingSystemStatus = pgTable('voting_system_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  isVotingEnabled: boolean('is_voting_enabled').default(true).notNull(),
  maxVotesPerUser: integer('max_votes_per_user').default(3).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').notNull().references(() => adminUsers.id),
})

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  votes: many(votes),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  submitter: one(users, {
    fields: [projects.submitterId],
    references: [users.id],
  }),
  votes: many(votes),
}))

export const votesRelations = relations(votes, ({ one }) => ({
  voter: one(users, {
    fields: [votes.voterId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [votes.projectId],
    references: [projects.id],
  }),
}))

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  systemStatusUpdates: many(votingSystemStatus),
}))

export const votingSystemStatusRelations = relations(votingSystemStatus, ({ one }) => ({
  updatedByAdmin: one(adminUsers, {
    fields: [votingSystemStatus.updatedBy],
    references: [adminUsers.id],
  }),
}))

// 类型导出
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type AdminUser = typeof adminUsers.$inferSelect
export type NewAdminUser = typeof adminUsers.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Vote = typeof votes.$inferSelect
export type NewVote = typeof votes.$inferInsert
export type VotingSystemStatus = typeof votingSystemStatus.$inferSelect
export type NewVotingSystemStatus = typeof votingSystemStatus.$inferInsert
