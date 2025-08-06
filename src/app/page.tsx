import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              投票系统
            </h1>
            <p className="text-xl text-gray-600">
              实名投票，公平公正的项目评选平台
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>参与者入口</CardTitle>
                <CardDescription>
                  注册账号，提交项目，参与投票
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Link href="/sign-up">
                    <Button className="w-full">注册账号</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full">用户登录</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>管理员入口</CardTitle>
                <CardDescription>
                  管理用户、项目和投票系统
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/sign-in">
                  <Button variant="secondary" className="w-full">管理员登录</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">投票规则</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">每人3票</h3>
                <p className="text-gray-600 text-sm">每位参与者拥有3票投票权</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚫</span>
                </div>
                <h3 className="font-semibold mb-2">不能自投</h3>
                <p className="text-gray-600 text-sm">不能给自己的项目投票</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold mb-2">实名投票</h3>
                <p className="text-gray-600 text-sm">需要表达投票依据和评价</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/about">
              <Button variant="outline" size="lg">
                了解更多关于投票系统
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}