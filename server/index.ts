import { config } from 'dotenv'
import { resolve } from 'path'
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from './routers';
import { checkDatabaseConnection } from './db/index';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  console.error('堆栈跟踪:', error.stack);
  // 不要退出进程，让服务器继续运行
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  // 不要退出进程，让服务器继续运行
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // 检查数据库连接
  log('检查数据库连接...');
  const dbCheck = await checkDatabaseConnection();
  if (!dbCheck.connected) {
    log(`❌ 数据库连接失败: ${dbCheck.error}`);
    log('⚠️ 服务器将终止启动');
    log('💡 请启动PostgreSQL服务后重启应用');
    return;
  } else {
    log('✅ 数据库连接正常');
  }

  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // 记录错误到控制台，但不要重新抛出
    console.error(`Error handling ${req.method} ${req.path}:`, err);

    // 如果响应还没有发送，发送错误响应
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
