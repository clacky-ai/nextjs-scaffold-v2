#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

// 路由配置接口
interface RouteConfig {
  endpoint: string
  publicPaths: string[]
  protectedPaths: string[]
  apiPaths: string[]
  authApiPaths: string[]
}

interface EndpointRouteMap {
  [endpoint: string]: RouteConfig
}

interface GeneratedRouteConfig {
  generatedAt: string
  endpoints: EndpointRouteMap
}

class RouteScanner {
  private srcDir: string
  private configOutputPath: string

  constructor(srcDir: string, configOutputPath: string) {
    this.srcDir = srcDir
    this.configOutputPath = configOutputPath
  }

  /**
   * 扫描并生成路由配置
   */
  async generateRouteConfig(): Promise<void> {
    console.log('🔍 开始扫描路由结构...')
    
    const appDir = path.join(this.srcDir, 'app')
    if (!fs.existsSync(appDir)) {
      console.error('❌ app 目录不存在:', appDir)
      return
    }

    const endpoints = await this.scanEndpoints(appDir)
    
    const config: GeneratedRouteConfig = {
      generatedAt: new Date().toISOString(),
      endpoints
    }

    // 确保输出目录存在
    const outputDir = path.dirname(this.configOutputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 生成 TypeScript 文件内容
    const tsContent = this.generateTypeScriptContent(config)
    
    // 写入配置文件
    fs.writeFileSync(
      this.configOutputPath, 
      tsContent, 
      'utf-8'
    )

    console.log('✅ 路由配置生成完成:', this.configOutputPath)
    console.log('📊 扫描到的端点:', Object.keys(endpoints))
  }

  /**
   * 扫描所有端点
   */
  private async scanEndpoints(appDir: string): Promise<EndpointRouteMap> {
    const endpoints: EndpointRouteMap = {}
    
    const items = fs.readdirSync(appDir)
    
    for (const item of items) {
      const itemPath = path.join(appDir, item)
      const stat = fs.statSync(itemPath)
      
      if (!stat.isDirectory()) continue
      
      // 跳过特殊目录
      if (item === 'api' || item === 'globals.css' || item.startsWith('.')) continue
      
      // 判断是否是端点目录
      if (this.isEndpointDirectory(itemPath)) {
        console.log(`📂 发现端点: ${item}`)
        const routeConfig = await this.scanEndpointRoutes(item, itemPath)
        endpoints[item] = routeConfig
      }
    }

    // 扫描 API 路由
    const apiDir = path.join(appDir, 'api')
    if (fs.existsSync(apiDir)) {
      await this.scanApiRoutes(apiDir, endpoints)
    }

    return endpoints
  }

  /**
   * 判断是否是端点目录
   * 端点目录应该包含 (public) 或 (protected) 子目录
   */
  private isEndpointDirectory(dirPath: string): boolean {
    if (!fs.existsSync(dirPath)) return false
    
    const items = fs.readdirSync(dirPath)
    const hasPublic = items.includes('(public)')
    const hasProtected = items.includes('(protected)')
    
    return hasPublic || hasProtected
  }

  /**
   * 扫描单个端点的路由
   */
  private async scanEndpointRoutes(endpointName: string, endpointDir: string): Promise<RouteConfig> {
    const config: RouteConfig = {
      endpoint: endpointName,
      publicPaths: [],
      protectedPaths: [],
      apiPaths: [],
      authApiPaths: []
    }

    // 扫描 (public) 目录
    const publicDir = path.join(endpointDir, '(public)')
    if (fs.existsSync(publicDir)) {
      config.publicPaths = await this.scanPagesInDirectory(publicDir, endpointName, 'public')
    }

    // 扫描 (protected) 目录  
    const protectedDir = path.join(endpointDir, '(protected)')
    if (fs.existsSync(protectedDir)) {
      config.protectedPaths = await this.scanPagesInDirectory(protectedDir, endpointName, 'protected')
    }

    return config
  }

  /**
   * 扫描目录中的页面路由
   */
  private async scanPagesInDirectory(
    directory: string, 
    endpointName: string, 
    type: 'public' | 'protected'
  ): Promise<string[]> {
    const routes: string[] = []
    
    console.log(`  📁 扫描 ${type} 目录: ${directory}`)
    
    const scan = (dir: string, basePath: string = '') => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          // 跳过以 _ 开头的私有目录
          if (item.startsWith('_')) continue
          
          // 处理动态路由 [param] 和 [...param]
          let routeSegment = item
          if (item.startsWith('[') && item.endsWith(']')) {
            // 保持动态路由的格式，但在实际路径中会被替换
            routeSegment = item
          }
          
          const newBasePath = basePath + '/' + routeSegment
          
          // 递归扫描子目录
          scan(itemPath, newBasePath)
          
          // 检查是否有 page.tsx/jsx
          const pageFiles = ['page.tsx', 'page.jsx', 'page.js']
          const hasPage = pageFiles.some(file => 
            fs.existsSync(path.join(itemPath, file))
          )
          
          if (hasPage) {
            const routePath = this.buildRoutePath(endpointName, newBasePath)
            routes.push(routePath)
            console.log(`    ✅ 发现页面: ${routePath}`)
          }
        }
      }
    }
    
    // 检查根目录是否有 page.tsx
    const rootPageFiles = ['page.tsx', 'page.jsx', 'page.js']
    const hasRootPage = rootPageFiles.some(file => 
      fs.existsSync(path.join(directory, file))
    )
    
    if (hasRootPage) {
      const rootPath = this.buildRoutePath(endpointName, '')
      routes.push(rootPath)
      console.log(`    ✅ 发现根页面: ${rootPath}`)
    }
    
    scan(directory)
    
    return routes.sort()
  }

  /**
   * 构建路由路径
   */
  private buildRoutePath(endpointName: string, pagePath: string): string {
    // 判断是否使用路由组
    const useRouteGroup = this.isRouteGroupEndpoint(endpointName)
    
    if (useRouteGroup) {
      // 路由组: (customer) -> 根路径 /
      return pagePath || '/'
    } else {
      // 普通路径: merchant -> /merchant
      return `/${endpointName}${pagePath}`
    }
  }

  /**
   * 判断端点是否使用路由组
   * 根据目录名是否用括号包围来判断
   */
  private isRouteGroupEndpoint(endpointName: string): boolean {
    // 如果端点名称被括号包围，则使用路由组
    return endpointName.startsWith('(') && endpointName.endsWith(')')
  }

  /**
   * 扫描 API 路由
   */
  private async scanApiRoutes(apiDir: string, endpoints: EndpointRouteMap): Promise<void> {
    console.log('📡 扫描 API 路由...')
    
    const items = fs.readdirSync(apiDir)
    
    for (const item of items) {
      const itemPath = path.join(apiDir, item)
      const stat = fs.statSync(itemPath)
      
      if (!stat.isDirectory()) continue
      
      // 检查是否是端点相关的 API
      if (endpoints[item]) {
        console.log(`  📂 发现端点 API: ${item}`)
        const apiPaths = await this.scanApiInDirectory(itemPath, item)
        endpoints[item].apiPaths = apiPaths.apiPaths
        endpoints[item].authApiPaths = apiPaths.authApiPaths
      }
    }
  }

  /**
   * 扫描 API 目录中的路由
   */
  private async scanApiInDirectory(
    directory: string, 
    endpointName: string
  ): Promise<{ apiPaths: string[], authApiPaths: string[] }> {
    const apiPaths: string[] = []
    const authApiPaths: string[] = []
    
    const scan = (dir: string, basePath: string = '') => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          const newBasePath = basePath + '/' + item
          scan(itemPath, newBasePath)
        } else if (item === 'route.ts' || item === 'route.js') {
          const apiPath = `/api/${endpointName}${basePath}`
          
          // 判断是否是认证相关的 API
          if (basePath.includes('/auth/') || basePath.includes('/register')) {
            authApiPaths.push(apiPath)
            console.log(`    🔐 认证 API: ${apiPath}`)
          } else {
            apiPaths.push(apiPath)
            console.log(`    🔗 普通 API: ${apiPath}`)
          }
        }
      }
    }
    
    scan(directory)
    
    return { apiPaths, authApiPaths }
  }

  /**
   * 生成 TypeScript 文件内容
   */
  private generateTypeScriptContent(config: GeneratedRouteConfig): string {
    const timestamp = new Date(config.generatedAt).toLocaleString('zh-CN')
    
    return `// 自动生成的路由配置文件
// 生成时间: ${timestamp}
// 请勿手动修改此文件

export interface RouteConfig {
  endpoint: string
  publicPaths: string[]
  protectedPaths: string[]
  apiPaths: string[]
  authApiPaths: string[]
}

export interface EndpointRouteMap {
  [endpoint: string]: RouteConfig
}

export interface GeneratedRouteConfig {
  generatedAt: string
  endpoints: EndpointRouteMap
}

export const generatedRoutes: GeneratedRouteConfig = ${JSON.stringify(config, null, 2)} as const

export default generatedRoutes
`
  }
}

/**
 * 主函数
 */
async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  const configOutputPath = path.join(process.cwd(), 'src', 'config', 'generated-routes.ts')
  
  const scanner = new RouteScanner(srcDir, configOutputPath)
  await scanner.generateRouteConfig()
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error)
}

export { RouteScanner }
