import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

// 端配置接口
interface EndpointConfig {
  name: string
  displayName: string
  pathPrefix: string
  defaultPage: string
  hasSignUp: boolean
  hasUnauthorized: boolean
  useRouteGroup: boolean
  authType: 'nextauth' | 'custom'
  tableName: string
  loginField: string
  cookiePrefix: string
  hasNavigation: boolean
  hasSidebar: boolean
  isDataDriven: boolean
  isManagementEnd: boolean
  roles?: string[]
}

interface ProjectConfig {
  scenario: string
  endpoints: EndpointConfig[]
}

interface SnippetConfig {
  targetFile: string
  insertPosition: string
  order?: number
  mergeStrategy?: string
}

interface CodeSnippet {
  config: SnippetConfig
  content: string
  endpointName: string
}

class TemplateRenderer {
  private templateDir: string
  private outputDir: string

  constructor(templateDir: string, outputDir: string) {
    this.templateDir = templateDir
    this.outputDir = outputDir
    this.registerHelpers()
  }

  private registerHelpers() {
    // 注册 Handlebars 辅助函数
    Handlebars.registerHelper('pascalCase', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, '')
    })

    Handlebars.registerHelper('camelCase', (str: string) => {
      return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_]/g, '')
    })

    Handlebars.registerHelper('kebabCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    })

    Handlebars.registerHelper('snakeCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
    })

    Handlebars.registerHelper('uppercaseSnakeCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
    })

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b)
    Handlebars.registerHelper('or', (a: any, b: any) => a || b)
  }

  async renderEndpoint(config: EndpointConfig): Promise<string> {
    const endpointOutputDir = path.join(this.outputDir, `rendered-${config.name}-endpoint`)
    
    // 创建输出目录
    await this.ensureDir(endpointOutputDir)

    // 渲染模板文件
    await this.renderTemplateFiles(config, endpointOutputDir)

    // 渲染代码片段
    await this.renderCodeSnippets(config, endpointOutputDir)

    return endpointOutputDir
  }

  private async renderTemplateFiles(config: EndpointConfig, outputDir: string) {
    const srcTemplateDir = path.join(this.templateDir, 'src')
    const srcOutputDir = path.join(outputDir, 'src')

    await this.renderDirectory(srcTemplateDir, srcOutputDir, config)
  }

  private async renderDirectory(templateDir: string, outputDir: string, config: EndpointConfig) {
    if (!fs.existsSync(templateDir)) return

    await this.ensureDir(outputDir)

    const items = fs.readdirSync(templateDir)

    for (const item of items) {
      const templatePath = path.join(templateDir, item)
      const stat = fs.statSync(templatePath)

      if (stat.isDirectory()) {
        // 处理目录名中的模板变量
        const processedDirName = this.processTemplateName(item, config)
        const newOutputDir = path.join(outputDir, processedDirName)
        
        await this.renderDirectory(templatePath, newOutputDir, config)
      } else if (item.endsWith('.hbs')) {
        // 渲染模板文件
        const outputFileName = item.replace('.hbs', '')
        const processedFileName = this.processTemplateName(outputFileName, config)
        const outputPath = path.join(outputDir, processedFileName)

        await this.renderTemplateFile(templatePath, outputPath, config)
      } else {
        // 直接复制非模板文件
        const outputPath = path.join(outputDir, item)
        fs.copyFileSync(templatePath, outputPath)
      }
    }
  }

  private async renderTemplateFile(templatePath: string, outputPath: string, config: EndpointConfig) {
    const templateContent = fs.readFileSync(templatePath, 'utf-8')
    const template = Handlebars.compile(templateContent)
    const rendered = template(config)

    // 确保输出目录存在
    await this.ensureDir(path.dirname(outputPath))
    fs.writeFileSync(outputPath, rendered)
  }

  private async renderCodeSnippets(config: EndpointConfig, outputDir: string) {
    const snippetsTemplateDir = path.join(this.templateDir, 'code-snippets')
    const snippetsOutputDir = path.join(outputDir, 'code-snippets-rendered')

    if (!fs.existsSync(snippetsTemplateDir)) return

    await this.ensureDir(snippetsOutputDir)

    const targetDirs = fs.readdirSync(snippetsTemplateDir)

    for (const targetDir of targetDirs) {
      const targetDirPath = path.join(snippetsTemplateDir, targetDir)
      if (!fs.statSync(targetDirPath).isDirectory()) continue

      const snippetFiles = fs.readdirSync(targetDirPath)

      for (const snippetFile of snippetFiles) {
        if (!snippetFile.endsWith('.snippet')) continue

        const snippetPath = path.join(targetDirPath, snippetFile)
        const processedFileName = this.processTemplateName(snippetFile, config)
        const outputPath = path.join(snippetsOutputDir, processedFileName.replace('.snippet', ''))

        await this.renderSnippetFile(snippetPath, outputPath, config)
      }
    }
  }

  private async renderSnippetFile(snippetPath: string, outputPath: string, config: EndpointConfig) {
    const snippetContent = fs.readFileSync(snippetPath, 'utf-8')
    const template = Handlebars.compile(snippetContent)
    const rendered = template(config)

    await this.ensureDir(path.dirname(outputPath))
    fs.writeFileSync(outputPath, rendered)
  }

  private processTemplateName(name: string, config: EndpointConfig): string {
    let processed = name

    // 处理端点路径
    if (name.includes('{{ENDPOINT_PATH}}')) {
      const pathName = config.useRouteGroup 
        ? `(${config.name})` 
        : config.pathPrefix.replace('/', '')
      processed = processed.replace('{{ENDPOINT_PATH}}', pathName)
    }

    // 处理端点名称
    processed = processed.replace(/\{\{ENDPOINT_NAME\}\}/g, config.name)

    // 处理默认页面
    processed = processed.replace(/\{\{DEFAULT_PAGE\}\}/g, config.defaultPage)

    return processed
  }

  private async ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

class ProjectMerger {
  private projectRoot: string

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * 复制基础项目模板到输出目录
   */
  async copyBaseProject(basicProjDir: string, targetDir: string) {
    // 确保目标目录存在
    await this.ensureDir(targetDir)

    if (fs.existsSync(basicProjDir)) {
      console.log(`📂 正在复制基础项目模板从 ${basicProjDir} 到 ${targetDir}`)
      await this.copyDirectoryStructure(basicProjDir, targetDir)
    } else {
      console.log(`⚠️  基础项目模板不存在: ${basicProjDir}`)
      console.log(`📁 创建空的项目目录: ${targetDir}`)
      // 创建基本的项目结构
      await this.createBasicProjectStructure(targetDir)
    }
  }

  /**
   * 创建基本的项目结构（当 basic_proj 不存在时）
   */
  private async createBasicProjectStructure(targetDir: string) {
    const dirs = [
      'src',
      'src/lib',
      'src/lib/db',
      'src/components',
      'src/components/ui'
    ]

    for (const dir of dirs) {
      await this.ensureDir(path.join(targetDir, dir))
    }

    // 创建基础的 package.json
    const basicPackageJson = {
      "name": "generated-project",
      "version": "1.0.0",
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      "dependencies": {
        "next": "15.2.4",
        "react": "^19",
        "react-dom": "^19"
      },
      "devDependencies": {
        "typescript": "^5",
        "@types/node": "^22",
        "@types/react": "^19",
        "@types/react-dom": "^19"
      }
    }

    fs.writeFileSync(
      path.join(targetDir, 'package.json'), 
      JSON.stringify(basicPackageJson, null, 2)
    )

    // 创建基础的 middleware.ts
    const basicMiddleware = `import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API路由在各自处理函数中认证
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}`

    fs.writeFileSync(path.join(targetDir, 'src', 'middleware.ts'), basicMiddleware)
  }

  async mergeEndpoint(renderedEndpointDir: string) {
    // 合并目录结构
    const srcDir = path.join(renderedEndpointDir, 'src')
    if (fs.existsSync(srcDir)) {
      await this.copyDirectoryStructure(srcDir, path.join(this.projectRoot, 'src'))
    }

    // 合并代码片段
    const snippetsDir = path.join(renderedEndpointDir, 'code-snippets-rendered')
    if (fs.existsSync(snippetsDir)) {
      await this.mergeCodeSnippets(snippetsDir)
    }
  }

  private async copyDirectoryStructure(sourceDir: string, targetDir: string) {
    if (!fs.existsSync(sourceDir)) return

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const items = fs.readdirSync(sourceDir)

    for (const item of items) {
      const sourcePath = path.join(sourceDir, item)
      const targetPath = path.join(targetDir, item)
      const stat = fs.statSync(sourcePath)

      if (stat.isDirectory()) {
        await this.copyDirectoryStructure(sourcePath, targetPath)
      } else {
        if (!fs.existsSync(path.dirname(targetPath))) {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        }
        fs.copyFileSync(sourcePath, targetPath)
      }
    }
  }

  private async mergeCodeSnippets(snippetsDir: string) {
    const snippetFiles = fs.readdirSync(snippetsDir)

    for (const snippetFile of snippetFiles) {
      const snippetPath = path.join(snippetsDir, snippetFile)
      const snippet = this.parseSnippet(snippetPath)

      await this.mergeSnippetToFile(snippet)
    }
  }

  private parseSnippet(snippetPath: string): CodeSnippet {
    const content = fs.readFileSync(snippetPath, 'utf-8')
    const [configSection, ...contentSections] = content.split('---')
    
    const config = JSON.parse(configSection.trim()) as SnippetConfig
    const snippetContent = contentSections.join('---').trim()

    return {
      config,
      content: snippetContent,
      endpointName: path.basename(snippetPath, path.extname(snippetPath))
    }
  }

  private async mergeSnippetToFile(snippet: CodeSnippet) {
    const targetPath = path.join(this.projectRoot, snippet.config.targetFile)
    
    // 确保目标文件存在
    if (!fs.existsSync(targetPath)) {
      await this.createBaseFile(targetPath, snippet.config)
    }

    let fileContent = fs.readFileSync(targetPath, 'utf-8')

    // 根据插入位置合并内容
    switch (snippet.config.insertPosition) {
      case 'function-body':
        fileContent = this.insertIntoFunctionBody(fileContent, snippet.content)
        break
      case 'imports':
        fileContent = this.insertImports(fileContent, snippet.content)
        break
      case 'dependencies':
        fileContent = this.mergeDependencies(fileContent, snippet.content)
        break
      case 'endpoint-configs':
        fileContent = this.insertEndpointConfig(fileContent, snippet.content)
        break
      case 'schema-exports':
        fileContent = this.insertSchemaExport(fileContent, snippet.content)
        break
      default:
        console.warn(`Unknown insert position: ${snippet.config.insertPosition}`)
    }

    fs.writeFileSync(targetPath, fileContent)
  }

  private async createBaseFile(targetPath: string, config: SnippetConfig) {
    const dir = path.dirname(targetPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // 根据文件类型创建基础文件
    if (targetPath.endsWith('middleware.ts')) {
      const baseMiddleware = `import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API路由在各自处理函数中认证
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}`
      fs.writeFileSync(targetPath, baseMiddleware)
    } else if (targetPath.endsWith('package.json')) {
      const basePackage = {
        dependencies: {}
      }
      fs.writeFileSync(targetPath, JSON.stringify(basePackage, null, 2))
    } else if (targetPath.endsWith('schema/index.ts')) {
      // 创建空的 schema index 文件
      fs.writeFileSync(targetPath, '// Auto-generated schema exports\n')
    }
  }

  private insertIntoFunctionBody(content: string, snippet: string): string {
    // 在 middleware 函数的 return NextResponse.next() 之前插入
    const returnPattern = /(\s*)(return NextResponse\.next\(\))/
    return content.replace(returnPattern, `$1${snippet}\n\n$1$2`)
  }

  private insertImports(content: string, snippet: string): string {
    // 在现有 import 语句后添加新的 import
    const lines = content.split('\n')
    let lastImportIndex = -1

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, snippet)
    } else {
      lines.unshift(snippet)
    }

    return lines.join('\n')
  }

  private mergeDependencies(content: string, snippet: string): string {
    const packageJson = JSON.parse(content)
    const newDeps = JSON.parse(snippet)

    packageJson.dependencies = { ...packageJson.dependencies, ...newDeps }

    return JSON.stringify(packageJson, null, 2)
  }

  private insertSchemaExport(content: string, snippet: string): string {
    // 在文件末尾添加 export 语句
    const trimmedContent = content.trim()
    const trimmedSnippet = snippet.trim()
    
    // 如果文件为空，直接返回 snippet
    if (!trimmedContent) {
      return trimmedSnippet + '\n'
    }
    
    // 在文件末尾添加新的 export
    return trimmedContent + '\n' + trimmedSnippet + '\n'
  }

  private insertEndpointConfig(content: string, snippet: string): string {
    // 在 ENDPOINT_CONFIGS 数组中插入端配置
    const configArrayPattern = /(const ENDPOINT_CONFIGS: EndpointConfig\[\] = \[)([\s\S]*?)(\];)/
    
    return content.replace(configArrayPattern, (match, start, existingConfigs, end) => {
      // 如果已经有配置，在最后添加
      const newConfig = existingConfigs.trim() ? existingConfigs + '\n  ' + snippet : '\n  ' + snippet
      return start + newConfig + '\n' + end
    })
  }

  private async ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

// 主渲染函数
export async function renderProject() {
  try {
    // 读取配置
    const configPath = path.join(__dirname, 'config.json')
    const config: ProjectConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

    console.log(`🚀 开始渲染项目: ${config.scenario}`)
    console.log(`📊 检测到 ${config.endpoints.length} 个端:`, config.endpoints.map(e => e.displayName).join(', '))

    // 设置路径
    const templateDir = path.join(__dirname, 'basic')
    const basicProjDir = path.join(__dirname, 'basic_proj')
    const outputDir = path.join(__dirname, '..', 'rendered-output')
    const finalProjectDir = path.join(outputDir, 'final-project')

    // 检查基础项目模板是否存在
    if (!fs.existsSync(basicProjDir)) {
      console.warn(`⚠️  基础项目模板不存在: ${basicProjDir}`)
      console.log(`💡 请确保 ${basicProjDir} 目录存在并包含基础项目文件`)
    }

    const renderer = new TemplateRenderer(templateDir, outputDir)
    const merger = new ProjectMerger(finalProjectDir)

    // 第一步：复制基础项目模板到输出目录
    console.log(`📁 正在复制基础项目模板...`)
    await merger.copyBaseProject(basicProjDir, finalProjectDir)
    console.log(`✅ 基础项目模板复制完成: ${finalProjectDir}`)

    // 第二步：渲染每个端并合并
    for (const endpoint of config.endpoints) {
      console.log(`🔄 正在渲染 ${endpoint.displayName}...`)
      
      const renderedDir = await renderer.renderEndpoint(endpoint)
      console.log(`✅ ${endpoint.displayName} 渲染完成: ${renderedDir}`)

      console.log(`🔗 正在合并 ${endpoint.displayName} 到项目...`)
      await merger.mergeEndpoint(renderedDir)
      console.log(`✅ ${endpoint.displayName} 合并完成`)
    }

    console.log(`🎉 项目渲染完成！`)
    console.log(`📁 最终项目位置: ${finalProjectDir}`)
    console.log(`💡 你可以将 ${finalProjectDir} 的内容复制到你的项目目录中`)
    console.log(`📝 接下来的步骤:`)
    console.log(`   1. cd ${finalProjectDir}`)
    console.log(`   2. pnpm install`)
    console.log(`   3. 配置环境变量 (.env.local)`)
    console.log(`   4. pnpm db:push && pnpm db:seed`)
    console.log(`   5. pnpm dev`)

  } catch (error) {
    console.error('❌ 渲染过程中发生错误:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件，执行渲染
if (require.main === module) {
  renderProject()
}