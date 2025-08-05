import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 使用明确的连接配置
const client = postgres({
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'voting_system',
  ssl: false,
  prepare: false,
})

export const db = drizzle(client, { schema })
