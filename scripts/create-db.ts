import postgres from 'postgres'

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'default'
  
  // 连接到默认的postgres数据库
  const sql = postgres({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres',
    ssl: process.env.DB_SSL === 'true',
  })

  try {
    // 检查数据库是否已存在
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `

    if (result.length === 0) {
      // 创建数据库
      await sql.unsafe(`CREATE DATABASE ${dbName}`)
      console.log(`✅ 数据库 ${dbName} 创建成功`)
    } else {
      console.log(`ℹ️ 数据库 ${dbName} 已存在`)
    }
  } catch (error) {
    console.error('❌ 创建数据库失败:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

createDatabase()
