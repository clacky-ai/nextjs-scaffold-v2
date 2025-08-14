import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

/**
 * 生成路由配置的预处理函数
 */
function generateRouteConfig() {
  try {
    console.log('🔄 正在生成路由配置...')
    
    // 运行路由扫描脚本
    execSync('tsx scripts/generate-route-config.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    console.log('✅ 路由配置生成完成')
  } catch (error) {
    console.warn('⚠️  路由配置生成失败:', error.message)
    
    // 创建默认配置文件以防构建失败
    const configDir = path.join(process.cwd(), 'config')
    const configPath = path.join(configDir, 'generated-routes.json')
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        generatedAt: new Date().toISOString(),
        endpoints: {}
      }
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
      console.log('📝 已创建默认路由配置文件')
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.clackypaas.com'],
  
  // 在构建开始前生成路由配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 只在服务端构建时生成一次
    if (isServer && !dev) {
      generateRouteConfig()
    }
    
    return config
  },
}

// 在开发模式下也生成路由配置
if (process.env.NODE_ENV === 'development') {
  generateRouteConfig()
}

export default nextConfig
