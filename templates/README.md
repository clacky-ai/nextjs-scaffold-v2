# 原子化端模板系统

这是一个基于 LLM 预测的多端 Next.js 项目自动化脚手架系统。

## 🎯 系统概览

### 工作流程
1. **LLM 分析** → 根据业务场景分析需要几个端
2. **配置生成** → 生成 `templates/config.json` 配置文件
3. **模板渲染** → 基于配置渲染原子化模板
4. **项目合并** → 将渲染结果合并到项目中

### 核心特性
- 🤖 **LLM 驱动**：根据业务场景智能分析端的需求
- 🧩 **原子化设计**：每个端都是完整的、独立的模块
- 🔧 **灵活合并**：支持代码片段合并到现有文件
- 📁 **标准化架构**：生成一致的项目结构

## 📊 支持的端类型

根据 few shot 分析，系统支持各种业务场景：

### 电商场景
- **顾客端**：购物、订单管理、个人中心
- **商家端**：商品管理、订单处理、数据分析  
- **管理员端**：平台管理、商家审核

### SaaS场景
- **用户端**：使用产品功能、团队协作
- **管理员端**：租户管理、系统监控

### 内容平台
- **访客端**：内容浏览、互动
- **创作者端**：内容管理、数据分析
- **管理员端**：内容审核、平台管理

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置端信息
编辑 `templates/config.json`，或通过 LLM 自动生成：

```json
{
  "scenario": "卖咖啡独立网站",
  "endpoints": [
    {
      "name": "customer",
      "displayName": "顾客端",
      "pathPrefix": "/(customer)",
      "defaultPage": "account",
      "hasSignUp": true,
      "hasUnauthorized": true,
      "authType": "nextauth",
      "tableName": "users",
      "loginField": "email"
    }
  ]
}
```

### 3. 执行渲染
```bash
pnpm template:render
```

### 4. 初始化数据库
```bash
pnpm db:push
pnpm db:seed
```

## 📁 生成的项目结构

```
src/
├── app/
│   ├── (customer)/          # 顾客端页面
│   ├── merchant/            # 商家端页面
│   ├── admin/               # 管理员端页面
│   └── api/
│       ├── customer/        # 顾客端API
│       ├── merchant/        # 商家端API
│       └── admin/           # 管理员端API
├── lib/
│   ├── auth/               # 各端认证配置
│   └── db/schema/          # 各端数据表
├── stores/                 # 按端分离的状态管理
│   ├── customer/
│   ├── merchant/
│   └── admin/
├── components/             # 按端分离的组件
│   ├── customer/
│   ├── merchant/
│   └── admin/
└── middleware.ts          # 合并所有端的认证逻辑
```

## 🔧 配置详解

### 端配置参数 (EndpointConfig)

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `name` | string | 端名称（英文） | "customer", "merchant", "admin" |
| `displayName` | string | 端显示名称 | "顾客端", "商家端" |
| `pathPrefix` | string | 路由前缀 | "/(customer)", "/merchant" |
| `defaultPage` | string | 登录后默认页面 | "account", "dashboard" |
| `hasSignUp` | boolean | 是否支持注册 | true, false |
| `hasUnauthorized` | boolean | 是否有未登录状态 | true, false |
| `authType` | string | 认证类型 | "nextauth", "custom" |
| `tableName` | string | 数据库表名 | "users", "merchant_users" |
| `loginField` | string | 登录字段 | "email", "username" |
| `hasNavigation` | boolean | 是否需要导航栏 | true, false |
| `hasSidebar` | boolean | 是否需要侧边栏 | true, false |
| `roles` | string[] | 角色列表 | ["店长", "员工"] |

### 默认页面命名规则

- **数据驱动型** (`isDataDriven: true`) → `dashboard`
  - 商家端、管理员端、SaaS工具
- **个人管理型** (`isDataDriven: false`) → `account`
  - 电商顾客端、个人博客读者
- **内容消费型** → `home` 或 `feed`
  - 社交平台、内容平台

## 📝 模板系统

### 目录结构
```
templates/
├── basic/                  # 基础原子化模板
│   ├── src/               # 源码模板
│   │   ├── app/           # 页面模板
│   │   ├── lib/           # 工具库模板
│   │   ├── stores/        # 状态管理模板
│   │   └── components/    # 组件模板
│   └── code-snippets/     # 代码片段
│       ├── src__middleware.ts/
│       ├── drizzle.config.ts/
│       └── package.json/
├── config.json           # 端配置（LLM生成）
└── render.ts             # 渲染引擎
```

### 模板变量
- `{{ENDPOINT_NAME}}` → 端名称
- `{{ENDPOINT_PATH}}` → 路由路径
- `{{DEFAULT_PAGE}}` → 默认页面名
- `{{displayName}}` → 显示名称

### Handlebars 辅助函数
- `{{pascalCase name}}` → PascalCase
- `{{camelCase name}}` → camelCase  
- `{{kebabCase name}}` → kebab-case
- `{{snakeCase name}}` → snake_case
- `{{eq a b}}` → 等值比较
- `{{#if condition}}` → 条件判断

## 🔄 代码片段合并

系统支持灵活的代码片段合并机制：

### 片段配置
```json
{
  "targetFile": "src/middleware.ts",
  "insertPosition": "function-body",
  "order": 100
}
```

### 支持的插入位置
- `function-body` → 函数体内
- `imports` → 导入语句区
- `dependencies` → package.json 依赖
- `exports` → 导出语句区

### 合并策略
- `append` → 追加内容
- `merge-object` → 合并对象（用于 JSON）
- `replace` → 替换内容

## 🎨 Few Shot 示例

### 电商咖啡网站
```xml
<endpoints>
1. **顾客端**
   - 未登录状态
   - 已登录状态  
   - **存在共享页面**
   - **登录后默认页面**: /account

2. **商家管理端**
   - 仅已登录状态
   - **角色**：店长、员工
   - **登录后默认页面**: /dashboard

3. **超级管理员端**
   - 仅已登录状态
   - **登录后默认页面**: /dashboard
</endpoints>
```

### SaaS项目管理
```xml
<endpoints>
1. **用户端**
   - 未登录状态
   - 已登录状态
   - **存在共享页面**
   - **角色**：普通用户、Team管理员、组织管理员
   - **登录后默认页面**: /dashboard

2. **平台管理端**
   - 仅已登录状态
   - **登录后默认页面**: /dashboard
</endpoints>
```

## 🛠️ 开发指南

### 添加新的端类型

1. **更新配置**
```json
{
  "endpoints": [
    {
      "name": "teacher",
      "displayName": "教师端",
      "pathPrefix": "/teacher",
      "defaultPage": "workspace",
      "authType": "nextauth",
      "tableName": "teacher_users"
    }
  ]
}
```

2. **执行渲染**
```bash
pnpm template:render
```

3. **自定义业务逻辑**
```bash
# 在生成的结构基础上添加业务功能
src/app/teacher/dashboard/courses/page.tsx
src/app/api/teacher/courses/route.ts
src/stores/teacher/courses-store.ts
```

### 扩展模板系统

**添加新的代码片段类型：**
```
code-snippets/
└── next.config.mjs/
    └── middleware-config-{{ENDPOINT_NAME}}.js.snippet
```

**片段内容：**
```json
{
  "targetFile": "next.config.mjs",
  "insertPosition": "exports",
  "order": 50
}
---
export const {{name}}Config = {
  // 端特定配置
}
```

### 自定义认证策略

**OAuth 支持：**
```json
{
  "authType": "nextauth",
  "providers": ["google", "github"],
  "allowSocialLogin": true
}
```

**自定义认证字段：**
```json
{
  "loginField": "phone",
  "additionalFields": ["verificationCode"],
  "requireTwoFactor": true
}
```

## 📊 架构优势

### 🎯 **精确匹配业务需求**
- 根据业务场景自动判断端的数量和类型
- 避免过度设计或功能不足
- 生成最贴合实际需求的架构

### 🧩 **完全模块化**
- 每个端都是独立的原子化模块
- 端间完全解耦，互不影响
- 支持并行开发和独立部署

### 🔄 **高度可扩展**
- 新增端只需更新配置文件
- 模板系统支持任意复杂度的定制
- 代码片段合并机制极其灵活

### 🚀 **开发效率**
- 从业务描述到完整项目，几分钟完成
- 标准化的架构减少学习成本
- 自动化的代码生成避免重复工作

## 🔍 故障排除

### 常见问题

**Q: 渲染失败，提示模板变量未找到**
A: 检查 `config.json` 中的字段是否完整，特别是必需字段如 `name`、`pathPrefix` 等。

**Q: 代码片段合并失败**
A: 确认目标文件存在，检查片段配置中的 `insertPosition` 是否正确。

**Q: 认证不工作**
A: 检查环境变量设置，确保 `NEXTAUTH_SECRET` 等认证密钥已配置。

**Q: 数据库连接失败**
A: 确认数据库配置正确，运行 `pnpm db:push` 创建表结构。

### 调试技巧

**查看渲染输出：**
```bash
# 渲染输出保存在 templates/rendered-output/
ls templates/rendered-output/
```

**验证配置：**
```bash
# 检查配置文件语法
node -e "console.log(JSON.parse(require('fs').readFileSync('templates/config.json')))"
```

**测试单个端：**
```json
{
  "endpoints": [
    // 只保留一个端进行测试
  ]
}
```

## 🤝 贡献指南

### 添加新的业务场景模板
1. 在 `templates/scenarios/` 创建新场景
2. 提供 few shot 示例
3. 更新文档说明

### 扩展模板功能
1. Fork 项目
2. 在 `templates/basic/` 添加新模板
3. 测试渲染功能
4. 提交 PR

### 报告问题
- 描述业务场景
- 提供配置文件
- 附上错误日志

## 📜 许可证

MIT License - 详见 LICENSE 文件

---

🎉 **享受高效的多端开发体验！**