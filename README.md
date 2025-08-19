# 投票评选系统

一个功能完整的投票评选系统，支持项目提交、多维度评分、实时统计等功能。

## 🚀 功能特性

### 1. 用户管理
- ✅ 实名制注册与身份验证
- ✅ 项目提交者与投票者角色区分
- ✅ 个人资料管理（姓名、联系方式、所属团队等）
- ✅ JWT身份验证和会话管理

### 2. 项目管理
- ✅ 项目提交功能（标题、描述、团队成员、演示链接/文件上传）
- ✅ 项目分类/标签（可按技术领域、应用场景等分类）
- ✅ 项目展示页面（包含完整项目信息和评分情况）
- ✅ 项目编辑和删除功能

### 3. 投票机制
- ✅ 每用户3票限制的实现与验证
- ✅ 防止自投机制（系统自动识别项目成员）
- ✅ 投票过程中的评分界面（可针对5个维度单独打分）
- ✅ 投票理由/评价的文字输入（强制性要求）
- ✅ 多维度加权评分系统

### 4. 结果统计与展示
- ✅ 实时票数统计与排名
- ✅ 各评分维度的分析图表
- ✅ 评价内容的汇总展示
- ✅ 最终结果公布与导出功能
- ✅ 分类统计和详细分析

## 🛠️ 技术栈

### 后端
- **Node.js + Express** - 服务器框架
- **TypeScript** - 类型安全
- **Drizzle ORM** - 数据库ORM
- **PostgreSQL** - 数据库
- **JWT** - 身份验证
- **bcrypt** - 密码加密

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Zustand** - 状态管理
- **Wouter** - 路由管理
- **TanStack Query** - 数据获取
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库

### 开发工具
- **Vite** - 构建工具
- **tsx** - TypeScript执行器
- **ESLint** - 代码检查

## 📦 安装和运行

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd next-basic-scaffold-refactor
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：
```env
DATABASE_URL=postgresql://username:password@localhost:5432/voting2
JWT_SECRET=your-secret-key-change-in-production
```

4. **初始化数据库**
```bash
npm run db:init
npm run db:seed
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

### 默认账户
- **管理员**: admin@voting.com / admin123456
- **用户1**: user1@example.com / password123
- **用户2**: user2@example.com / password123

## 📚 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 项目管理
- `GET /api/categories` - 获取项目分类
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 投票功能
- `GET /api/score-dimensions` - 获取评分维度
- `GET /api/votes/stats` - 获取用户投票统计
- `GET /api/projects/:id/can-vote` - 检查是否可以投票
- `POST /api/votes` - 提交投票
- `GET /api/projects/:id/votes` - 获取项目投票结果
- `GET /api/votes/my-votes` - 获取用户投票历史
- `GET /api/votes/results` - 获取投票结果统计

## 🧪 测试

### API集成测试
```bash
npm run test:api
```

### 手动测试流程
1. 用户注册/登录
2. 提交项目
3. 浏览项目列表
4. 为项目投票
5. 查看投票结果
6. 查看个人投票历史

## 📁 项目结构

```
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # UI组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand状态管理
│   │   ├── hooks/         # 自定义hooks
│   │   └── lib/           # 工具库
├── server/                # 后端代码
│   ├── db/               # 数据库相关
│   ├── routes.ts         # API路由
│   ├── storage.ts        # 数据访问层
│   └── index.ts          # 服务器入口
├── scripts/              # 脚本文件
│   ├── init-db.ts       # 数据库初始化
│   ├── seed.ts          # 种子数据
│   └── test-api.ts      # API测试
└── README.md
```

## 🔒 安全特性

- JWT身份验证
- 密码加密存储
- 防止自投机制
- 投票数量限制
- 输入验证和清理
- SQL注入防护

## 🎯 核心业务逻辑

### 投票限制机制
1. 每用户最多3票
2. 不能为自己的项目投票
3. 每个项目只能投票一次
4. 必须填写评价理由（至少10字符）

### 评分系统
- 5个评分维度：技术创新性、实用价值、完成度、用户体验、展示效果
- 每个维度1-10分
- 不同维度有不同权重
- 最终得分为加权平均分

### 排名算法
- 按加权平均分排序
- 相同分数按投票数排序
- 实时更新排名

## 🚀 部署

### 生产环境部署
1. 构建项目：`npm run build`
2. 配置生产环境变量
3. 启动服务：`npm start`

### Docker部署
```bash
# 构建镜像
docker build -t voting-system .

# 运行容器
docker run -p 3000:3000 voting-system
```

## 📈 性能优化

- 数据库索引优化
- API响应缓存
- 前端状态管理优化
- 懒加载和代码分割
- 图片压缩和CDN

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**投票评选系统** - 让评选更公平、更透明、更高效！
