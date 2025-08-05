'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Vote {
  id: string
  reason: string
  createdAt: string
  project: {
    id: string
    title: string
  }
}

export function MyVotesSection() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyVotes()
  }, [])

  const fetchMyVotes = async () => {
    try {
      const response = await fetch('/api/votes')
      if (response.ok) {
        const data = await response.json()
        setVotes(data)
      } else {
        toast.error('获取投票记录失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        您还没有投票记录
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        您已投票 {votes.length} 次
      </div>
      
      {votes.map((vote) => (
        <Card key={vote.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{vote.project.title}</CardTitle>
                <CardDescription>
                  投票时间: {new Date(vote.createdAt).toLocaleString('zh-CN')}
                </CardDescription>
              </div>
              <Badge variant="default">已投票</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium mb-2">投票理由:</h4>
              <p className="text-gray-700">{vote.reason}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
