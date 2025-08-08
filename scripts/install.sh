#!/bin/bash

# install.sh - 自动安装和设置脚本
# 如果任何步骤失败，脚本将终止

set -e  # 遇到错误时立即退出

echo "开始执行安装脚本..."

# 步骤1: 执行 npm install
echo "步骤1: 执行 npm install..."
npm install
echo "✓ npm install 完成"

# 步骤2: 移动 .1024 文件到 /home/runner/.clackyai/.environments.yaml
echo "步骤2: 移动配置文件..."
if ! mkdir -p /home/runner/.clackyai/; then
    echo "❌ 创建目录 /home/runner/.clackyai/ 失败"
    echo "建议: Agent 请先查看 Handling environment configuration file 这份 playbook"
    exit 1
fi

if ! cp .1024 /home/runner/.clackyai/.environments.yaml; then
    echo "❌ 拷贝 .1024 文件到 /home/runner/.clackyai/.environments.yaml 失败"
    echo "请检查 .1024 文件是否存在以及目标路径权限"
    echo "建议: 请先查看 Handling environment configuration file 相关 playbook"
    exit 1
fi
echo "✓ 配置文件移动完成"

# 步骤3: 检查 PostgreSQL 数据库连接
echo "步骤3: 检查 PostgreSQL 数据库连接..."
if ! command -v psql &> /dev/null; then
    echo "❌ psql 命令未找到"
    echo "请检查 PostgreSQL 是否已安装"
    echo "建议: 请先查看 middleware 相关的 playbook，安装 postgres 数据库"
    exit 1
fi

# 检查 .env.local 文件是否存在，不存在则从 .env.example 复制
if [ ! -f ".env.local" ]; then
    echo "检测到 .env.local 文件不存在，正在从 .env.example 复制..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✓ .env.local 文件已创建"
    else
        echo "❌ .env.example 文件不存在，无法创建 .env.local"
        exit 1
    fi
else
    echo "✓ .env.local 文件已存在"
fi

# 从 .env.local 读取数据库配置
if [ -f ".env.local" ]; then
    source .env.local
    echo "✓ 已加载环境变量配置"
else
    echo "❌ 无法读取 .env.local 文件"
    exit 1
fi

echo "尝试连接数据库: $DB_HOST:$DB_PORT/$DB_NAME (用户: $DB_USER)"

# 尝试连接数据库
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" &> /dev/null; then
    echo "❌ PostgreSQL 数据库连接失败"
    echo "连接参数: Host=$DB_HOST, Port=$DB_PORT, User=$DB_USER, Database=$DB_NAME"
    echo "请检查数据库服务是否运行以及连接参数是否正确"
    echo "建议: Agent 请先查看 middleware 相关的 playbook，安装 postgres 数据库"
    exit 1
fi
echo "✓ PostgreSQL 数据库连接成功"

# 步骤4: 执行数据库初始化
echo "步骤4: 执行数据库初始化..."
npx tsx scripts/init-db.ts
echo "✓ 数据库初始化完成"

# 步骤5: 执行 npm run build
echo "步骤5: 执行构建..."
npm run build
echo "✓ 构建完成"

# 步骤6: 测试服务器连接 (需要先启动服务器)
echo "步骤6: 测试服务器连接..."
echo "注意: 请确保服务器已启动在 localhost:3000"
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✓ 服务器连接测试通过"
else
    echo "⚠️ 服务器连接测试失败，请检查服务器是否已启动"
    echo "可以运行 npm run dev 来启动开发服务器"
fi

# 步骤7: 执行 ls
echo "步骤7: 列出当前目录文件..."
ls -la
echo "✓ 目录列表显示完成"

# 步骤8: 打印 package.json 文件到控制台
echo "步骤8: 显示 package.json 内容..."
echo "==================== package.json ===================="
cat package.json
echo "==================== package.json 结束 ===================="
echo "✓ package.json 显示完成"

# 步骤9: 清理文件
echo "步骤9: 清理文件..."

# 删除 .1024 文件
if [ -f ".1024" ]; then
    rm -f .1024
    echo "✓ .1024 文件已删除"
else
    echo "✓ .1024 文件不存在，跳过删除"
fi

# 删除安装脚本
# echo "所有步骤执行成功！"
# echo "正在删除安装脚本..."
# rm -f "$0"
# echo "✓ 安装脚本已删除"

echo "🎉 安装完成！所有步骤都已成功执行。"