'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface SystemSettingsProps {
  onStatusUpdate: () => void
  currentStatus: {
    isVotingEnabled: boolean
    maxVotesPerUser: number
  } | null
}

export function SystemSettings({ onStatusUpdate, currentStatus }: SystemSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    isVotingEnabled: currentStatus?.isVotingEnabled ?? true,
    maxVotesPerUser: currentStatus?.maxVotesPerUser ?? 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onStatusUpdate()
        
        // 通知所有用户系统状态更新 (暂时禁用)
        // try {
        //   if ((global as any).io) {
        //     (global as any).io.to('voting-room').emit('system-status-update', settings)
        //   }
        // } catch (socketError) {
        //   console.error('Socket推送错误:', socketError)
        // }
      } else {
        toast.error(data.error || '更新失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>投票系统控制</CardTitle>
          <CardDescription>
            控制投票系统的开启/暂停状态和投票规则
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="voting-enabled"
                checked={settings.isVotingEnabled}
                onCheckedChange={(checked) => handleInputChange('isVotingEnabled', checked)}
              />
              <Label htmlFor="voting-enabled" className="text-sm font-medium">
                启用投票功能
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-votes">每人最大投票数</Label>
              <Input
                id="max-votes"
                type="number"
                min="1"
                max="10"
                value={settings.maxVotesPerUser}
                onChange={(e) => handleInputChange('maxVotesPerUser', parseInt(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-gray-500">
                设置每个用户最多可以投票的数量（1-10票）
              </p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? '更新中...' : '保存设置'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>当前系统状态</CardTitle>
          <CardDescription>
            查看当前投票系统的运行状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>投票状态:</span>
              <span className={`font-medium ${
                currentStatus?.isVotingEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentStatus?.isVotingEnabled ? '开启' : '暂停'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>最大投票数:</span>
              <span className="font-medium">{currentStatus?.maxVotesPerUser || 3} 票</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
