'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    team: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('密码确认不匹配')
      return
    }

    if (formData.password.length < 6) {
      toast.error('密码长度至少6位')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          team: formData.team,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('注册成功！请登录')
        router.push('/sign-in')
      } else {
        toast.error(data.error || '注册失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">用户注册</CardTitle>
          <CardDescription className="text-center">
            创建您的账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入您的真实姓名"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入邮箱地址"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码（至少6位）"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="请输入联系电话"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team">所属团队</Label>
              <Input
                id="team"
                name="team"
                type="text"
                value={formData.team}
                onChange={handleInputChange}
                placeholder="请输入所属团队"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            已有账号？{' '}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
