import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              关于投票系统
            </h1>
            <p className="text-xl text-gray-600">
              了解我们的实名投票平台
            </p>
          </div>

          {/* 系统介绍 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>系统特色</CardTitle>
                <CardDescription>
                  公平、透明、可信的投票体验
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">实名认证</h4>
                      <p className="text-gray-600 text-sm">确保每一票都来自真实用户</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">透明公开</h4>
                      <p className="text-gray-600 text-sm">投票过程和结果完全透明</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                      <span className="text-purple-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">公平机制</h4>
                      <p className="text-gray-600 text-sm">防止恶意投票和作弊行为</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>投票规则</CardTitle>
                <CardDescription>
                  简单明了的投票机制
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <span className="text-gray-700">每人拥有3票投票权</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-red-600 font-bold">🚫</span>
                    </div>
                    <span className="text-gray-700">不能给自己的项目投票</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-yellow-600 font-bold">📝</span>
                    </div>
                    <span className="text-gray-700">需要提供投票理由</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 使用流程 */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">使用流程</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">注册账号</h3>
                <p className="text-gray-600 text-sm">使用真实信息注册账号</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">提交项目</h3>
                <p className="text-gray-600 text-sm">上传您的参赛项目</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">参与投票</h3>
                <p className="text-gray-600 text-sm">为优秀项目投票</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">查看结果</h3>
                <p className="text-gray-600 text-sm">实时查看投票结果</p>
              </div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="text-center">
            <div className="space-x-4">
              <Link href="/sign-up">
                <Button size="lg">立即注册</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">返回首页</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
