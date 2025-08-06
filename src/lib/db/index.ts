import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "default",
  ssl: process.env.DB_SSL === "true",
  prepare: false,
};

// 使用环境变量的连接配置
const client = postgres(dbConfig);

// 监听连接错误
client.listen("connect", () => {
  console.log("✅ 数据库连接成功");
});

client.listen("error", (err: any) => {
  console.error("❌ 数据库连接错误:", {
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    position: err.position,
    internalPosition: err.internalPosition,
    internalQuery: err.internalQuery,
    where: err.where,
    schema: err.schema,
    table: err.table,
    column: err.column,
    dataType: err.dataType,
    constraint: err.constraint,
    file: err.file,
    line: err.line,
    routine: err.routine,
    stack: err.stack,
  });
});

export const db = drizzle(client, { schema });
