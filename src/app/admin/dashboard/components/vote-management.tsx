'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Vote {
  id: string
  reason: string
  createdAt: string
  voter: {
    id: string
    name: string
    email: string
  }
  project: {
    id: string
    title: string
  }
}

interface VoteManagementProps {
  onStatsUpdate: () => void
  searchTerm?: string
}

export function VoteManagement({ onStatsUpdate, searchTerm = '' }: VoteManagementProps) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchVotes()
  }, [])

  const fetchVotes = async () => {
    try {
      const response = await fetch('/api/admin/votes')
      if (response.ok) {
        const data = await response.json()
        setVotes(data)
      } else {
        toast.error('获取投票列表失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVote = async (voteId: string) => {
    setDeleteLoading(voteId)

    try {
      const response = await fetch('/api/admin/votes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setVotes(prev => prev.filter(vote => vote.id !== voteId))
        onStatsUpdate()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setDeleteLoading(null)
    }
  }

  // 过滤投票记录
  const filteredVotes = votes.filter(vote => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      vote.voter.name.toLowerCase().includes(searchLower) ||
      vote.voter.email.toLowerCase().includes(searchLower) ||
      vote.project.title.toLowerCase().includes(searchLower) ||
      vote.reason.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {searchTerm ? (
          <>
            搜索到 {filteredVotes.length} 条投票记录，共 {votes.length} 条记录
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                搜索: "{searchTerm}"
              </span>
            )}
          </>
        ) : (
          <>共 {votes.length} 条投票记录</>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>投票者</TableHead>
              <TableHead>项目</TableHead>
              <TableHead>投票理由</TableHead>
              <TableHead>投票时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVotes.length > 0 ? (
              filteredVotes.map((vote) => (
              <TableRow key={vote.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{vote.voter.name}</div>
                    <div className="text-sm text-gray-500">{vote.voter.email}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {vote.project.title}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-left">
                        {vote.reason.length > 50 
                          ? `${vote.reason.substring(0, 50)}...` 
                          : vote.reason
                        }
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>投票理由</DialogTitle>
                        <DialogDescription>
                          {vote.voter.name} 对 "{vote.project.title}" 的投票理由
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-gray-700">{vote.reason}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  {new Date(vote.createdAt).toLocaleString('zh-CN')}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={deleteLoading === vote.id}
                      >
                        {deleteLoading === vote.id ? '删除中...' : '删除'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除投票记录？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将永久删除 {vote.voter.name} 对 "{vote.project.title}" 的投票记录，此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteVote(vote.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? `没有找到匹配 "${searchTerm}" 的投票记录` : '暂无投票记录'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
