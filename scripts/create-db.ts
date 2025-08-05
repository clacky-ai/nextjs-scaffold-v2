import postgres from 'postgres'

async function createDatabase() {
  // 连接到默认的postgres数据库
  const sql = postgres({
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '123456',
    database: 'postgres',
    ssl: false,
  })

  try {
    // 检查数据库是否已存在
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = 'voting_system'
    `

    if (result.length === 0) {
      // 创建数据库
      await sql.unsafe('CREATE DATABASE voting_system')
      console.log('✅ 数据库 voting_system 创建成功')
    } else {
      console.log('ℹ️ 数据库 voting_system 已存在')
    }
  } catch (error) {
    console.error('❌ 创建数据库失败:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

createDatabase()
