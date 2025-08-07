'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useUserWebSocketStore } from '@/stores/user'
import { toast } from 'sonner'

interface Project {
  id: string
  title: string
  description: string
  teamMembers: string
  demoLink?: string
  category?: string
  tags?: string
  submitterName: string
  voteCount: number
  createdAt: string
}

interface VotingSectionProps {
  userId: string
  systemStatus: {
    isVotingEnabled: boolean
    maxVotesPerUser: number
  } | null
  viewOnly?: boolean
}

export function VotingSection({ userId, systemStatus, viewOnly = false }: VotingSectionProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [votingProject, setVotingProject] = useState<string | null>(null)
  const [voteReason, setVoteReason] = useState('')
  
  const { connection, onVoteUpdate, offVoteUpdate } = useUserWebSocketStore()

  useEffect(() => {
    fetchProjects()
    fetchUserVotes()
  }, []) // 只在组件挂载时执行一次

  useEffect(() => {
    if (connection.isConnected) {
      // 监听投票更新
      onVoteUpdate((data) => {
        setProjects(prev => prev.map(project =>
          project.id === data.projectId
            ? { ...project, voteCount: data.newVoteCount }
            : project
        ))

        if (!viewOnly) {
          toast.success(`${data.voterName} 给 "${data.projectTitle}" 投了一票！`)
        }
      })

      return () => {
        offVoteUpdate()
      }
    }
  }, [connection.isConnected, onVoteUpdate, offVoteUpdate, viewOnly])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      toast.error('获取项目列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    if (viewOnly) return
    
    try {
      const response = await fetch('/api/votes')
      if (response.ok) {
        const data = await response.json()
        setUserVotes(data.map((vote: any) => vote.projectId))
      }
    } catch (error) {
      console.error('获取投票记录失败:', error)
    }
  }

  const handleVote = async (projectId: string) => {
    if (!voteReason.trim()) {
      toast.error('请填写投票理由')
      return
    }

    setVotingProject(projectId)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          reason: voteReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('投票成功！')
        setUserVotes(prev => [...prev, projectId])
        setVoteReason('')
        fetchProjects() // 刷新项目列表
      } else {
        toast.error(data.error || '投票失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setVotingProject(null)
    }
  }

  const canVote = (project: Project) => {
    if (viewOnly || !systemStatus?.isVotingEnabled) return false
    if (userVotes.includes(project.id)) return false
    if (userVotes.length >= (systemStatus?.maxVotesPerUser || 3)) return false
    
    // 检查是否为自己的项目
    const teamMembers = JSON.parse(project.teamMembers || '[]')
    return !teamMembers.includes(userId) && project.submitterId !== userId
  }

  const getVoteButtonText = (project: Project) => {
    if (!systemStatus?.isVotingEnabled) return '投票已暂停'
    if (userVotes.includes(project.id)) return '已投票'
    if (userVotes.length >= (systemStatus?.maxVotesPerUser || 3)) return '投票已用完'
    
    const teamMembers = JSON.parse(project.teamMembers || '[]')
    if (teamMembers.includes(userId) || project.submitterId === userId) {
      return '不能给自己投票'
    }
    
    return '投票'
  }

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="space-y-4">
      {!viewOnly && (
        <div className="text-sm text-gray-600">
          您已使用 {userVotes.length} / {systemStatus?.maxVotesPerUser || 3} 票
        </div>
      )}
      
      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无项目
        </div>
      ) : (
        <div className="grid gap-4">
          {projects
            .sort((a, b) => b.voteCount - a.voteCount)
            .map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        提交者: {project.submitterName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {project.voteCount} 票
                      </Badge>
                      {project.category && (
                        <Badge variant="outline">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  
                  {project.demoLink && (
                    <div className="mb-4">
                      <a 
                        href={project.demoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        查看演示 →
                      </a>
                    </div>
                  )}
                  
                  {project.tags && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(project.tags).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!viewOnly && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!canVote(project)}
                          variant={userVotes.includes(project.id) ? "secondary" : "default"}
                        >
                          {getVoteButtonText(project)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>为 "{project.title}" 投票</DialogTitle>
                          <DialogDescription>
                            请说明您的投票理由和评价
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reason">投票理由 *</Label>
                            <Textarea
                              id="reason"
                              value={voteReason}
                              onChange={(e) => setVoteReason(e.target.value)}
                              placeholder="请说明您为什么选择这个项目..."
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleVote(project.id)}
                              disabled={votingProject === project.id || !voteReason.trim()}
                            >
                              {votingProject === project.id ? '投票中...' : '确认投票'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
