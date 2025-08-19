import { config } from 'dotenv'
import { resolve } from 'path'

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const API_BASE = 'http://localhost:3000/api'

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: any;
}

class APITester {
  private token: string | null = null;
  private results: TestResult[] = [];

  async request(method: string, endpoint: string, data?: any, useAuth = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }

    return result;
  }

  async test(name: string, testFn: () => Promise<any>) {
    try {
      console.log(`🧪 测试: ${name}`);
      const data = await testFn();
      this.results.push({ name, success: true, data });
      console.log(`✅ 通过: ${name}`);
    } catch (error) {
      this.results.push({ 
        name, 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      console.log(`❌ 失败: ${name} - ${error instanceof Error ? error.message : error}`);
    }
  }

  async runTests() {
    console.log('🚀 开始API集成测试...\n');

    // 1. 测试用户认证
    await this.test('用户登录', async () => {
      const result = await this.request('POST', '/auth/login', {
        email: 'admin@voting.com',
        password: 'admin123456'
      });
      this.token = result.token;
      return result;
    });

    await this.test('获取当前用户信息', async () => {
      return await this.request('GET', '/auth/me', undefined, true);
    });

    // 2. 测试分类管理
    await this.test('获取项目分类', async () => {
      return await this.request('GET', '/categories');
    });

    // 3. 测试项目管理
    let projectId: string = '';
    await this.test('创建项目', async () => {
      const result = await this.request('POST', '/projects', {
        title: '测试项目',
        description: '这是一个用于测试的项目，包含完整的功能演示和技术实现。',
        demoUrl: 'https://example.com/demo',
        repositoryUrl: 'https://github.com/test/project',
        tags: ['测试', 'API'],
        teamMembers: ['测试用户']
      }, true);
      projectId = result.project.id;
      return result;
    });

    await this.test('获取项目列表', async () => {
      return await this.request('GET', '/projects');
    });

    await this.test('获取单个项目', async () => {
      return await this.request('GET', `/projects/${projectId}`);
    });

    await this.test('更新项目', async () => {
      return await this.request('PUT', `/projects/${projectId}`, {
        title: '更新后的测试项目',
        description: '这是一个更新后的测试项目描述。'
      }, true);
    });

    // 4. 测试投票功能
    await this.test('获取评分维度', async () => {
      return await this.request('GET', '/score-dimensions');
    });

    await this.test('获取用户投票统计', async () => {
      return await this.request('GET', '/votes/stats', undefined, true);
    });

    await this.test('检查投票权限', async () => {
      return await this.request('GET', `/projects/${projectId}/can-vote`, undefined, true);
    });

    // 5. 测试投票结果
    await this.test('获取投票结果', async () => {
      return await this.request('GET', '/votes/results');
    });

    await this.test('获取用户投票历史', async () => {
      return await this.request('GET', '/votes/my-votes', undefined, true);
    });

    // 6. 清理测试数据
    await this.test('删除测试项目', async () => {
      return await this.request('DELETE', `/projects/${projectId}`, undefined, true);
    });

    // 输出测试结果
    this.printResults();
  }

  printResults() {
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`📈 成功率: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }
    
    console.log('\n🎉 API集成测试完成!');
  }
}

// 运行测试
async function main() {
  const tester = new APITester();
  await tester.runTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
