# 投票系统

一个功能完整的实名投票系统，支持项目提交、投票和管理功能。

## 功能特性

### 投票规则
- 每位参与者拥有3票投票权
- 不能给自己的项目投票
- 实名投票，需要表达投票依据和评价

### 用户功能
- 用户注册与身份验证（实名制）
- 项目提交（标题、描述、团队成员、演示链接等）
- 项目浏览和投票
- 投票记录查看
- 实时投票结果统计

### 管理员功能
- 独立的管理员登录系统
- 用户管理（屏蔽/恢复用户投票权限）
- 项目管理（屏蔽/恢复项目投票资格）
- 投票管理（查看和删除投票记录）
- 系统设置（开启/暂停投票，设置投票数量限制）

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: NextAuth.js（用户和管理员分离认证）
- **UI**: Tailwind CSS + shadcn/ui
- **包管理**: pnpm

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL
- pnpm

### 安装和运行

1. 安装依赖
```bash
pnpm install
```

2. 配置环境变量
复制 `.env.local` 并根据需要修改数据库连接信息

3. 初始化数据库
```bash
# 创建数据库
pnpm tsx scripts/create-db.ts

# 推送数据库结构
pnpm db:push

# 初始化种子数据
pnpm db:seed
```

4. 启动开发服务器
```bash
pnpm dev
```

5. 访问应用
- 用户端: http://localhost:3000
- 管理员端: http://localhost:3000/admin/sign-in

### 默认管理员账号
- 用户名: `admin`
- 密码: `admin123456`

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 用户认证
│   │   ├── admin/         # 管理员API
│   │   ├── projects/      # 项目管理
│   │   └── votes/         # 投票管理
│   ├── dashboard/         # 用户仪表板
│   ├── admin/             # 管理员后台
│   ├── sign-in/           # 用户登录
│   └── sign-up/           # 用户注册
├── lib/                   # 工具库
│   ├── auth/              # 认证配置
│   └── db/                # 数据库配置
├── components/            # React 组件
│   └── ui/                # UI 组件
├── hooks/                 # React Hooks
└── scripts/               # 脚本文件
```

## 数据库设计

### 主要表结构
- `users` - 用户表
- `admin_users` - 管理员表
- `projects` - 项目表
- `votes` - 投票表
- `voting_system_status` - 系统状态表

## API 文档

### 用户端 API
- `POST /api/auth/register` - 用户注册
- `GET/POST /api/auth/[...nextauth]` - 用户认证
- `GET/POST /api/projects` - 项目管理
- `GET/POST /api/votes` - 投票管理

### 管理员 API
- `POST /api/admin/auth/signin` - 管理员登录
- `GET/PATCH /api/admin/users` - 用户管理
- `GET/PATCH /api/admin/projects` - 项目管理
- `GET/DELETE /api/admin/votes` - 投票管理
- `GET/POST /api/admin/system` - 系统设置

## 开发说明

### 数据库操作
```bash
# 生成迁移文件
pnpm db:generate

# 推送到数据库
pnpm db:push

# 查看数据库
pnpm db:studio
```

### 测试
参考 `scripts/test-system.md` 进行功能测试

## 部署

1. 设置生产环境变量
2. 构建应用: `pnpm build`
3. 启动应用: `pnpm start`

## 许可证

MIT License
