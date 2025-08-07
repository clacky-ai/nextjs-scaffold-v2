'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useProjectStore } from '@/stores/admin'

interface ProjectManagementProps {
  onStatsUpdate: () => void
  searchTerm?: string
}

export function ProjectManagement({ onStatsUpdate, searchTerm = '' }: ProjectManagementProps) {
  const {
    projects,
    loading,
    toggleProjectStatus,
    deleteProject
  } = useProjectStore()
  
  const isLoading = loading.fetchProjects

  const handleToggleProjectStatus = async (projectId: string, isBlocked: boolean) => {
    const success = await toggleProjectStatus(projectId, isBlocked)
    if (success && onStatsUpdate) {
      onStatsUpdate()
    }
  }

  // 使用 store 的过滤功能，但支持本地 searchTerm
  const displayProjects = searchTerm 
    ? projects.filter(project => {
        const searchLower = searchTerm.toLowerCase()
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.submitterName.toLowerCase().includes(searchLower) ||
          project.submitterEmail.toLowerCase().includes(searchLower) ||
          (project.category && project.category.toLowerCase().includes(searchLower)) ||
          (project.tags && project.tags.toLowerCase().includes(searchLower))
        )
      })
    : projects

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {searchTerm ? (
          <>
            搜索到 {displayProjects.length} 个项目，共 {projects.length} 个项目
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                搜索: "{searchTerm}"
              </span>
            )}
          </>
        ) : (
          <>共 {projects.length} 个项目，其中 {projects.filter(p => !p.isBlocked).length} 个可投票项目</>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目标题</TableHead>
              <TableHead>提交者</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>投票数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProjects.length > 0 ? (
              displayProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto font-medium">
                        {project.title}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{project.title}</DialogTitle>
                        <DialogDescription>
                          提交者: {project.submitterName} ({project.submitterEmail})
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">项目描述:</h4>
                          <p className="text-gray-700">{project.description}</p>
                        </div>
                        
                        {project.demoLink && (
                          <div>
                            <h4 className="font-medium mb-2">演示链接:</h4>
                            <a 
                              href={project.demoLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {project.demoLink}
                            </a>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-2">团队成员ID:</h4>
                          <p className="text-gray-700">
                            {JSON.parse(project.teamMembers || '[]').join(', ')}
                          </p>
                        </div>
                        
                        {project.tags && (
                          <div>
                            <h4 className="font-medium mb-2">标签:</h4>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(project.tags).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{project.submitterName}</div>
                    <div className="text-sm text-gray-500">{project.submitterEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{project.category || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {project.voteCount} 票
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={project.isBlocked ? 'destructive' : 'default'}>
                    {project.isBlocked ? '已屏蔽' : '正常'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                </TableCell>
                <TableCell>
                  <Button
                    variant={project.isBlocked ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => handleToggleProjectStatus(project.id, project.isBlocked)}
                    disabled={loading[`toggleProject_${project.id}`]}
                  >
                    {loading[`toggleProject_${project.id}`] 
                      ? '处理中...' 
                      : project.isBlocked ? '恢复' : '屏蔽'
                    }
                  </Button>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? `没有找到匹配 "${searchTerm}" 的项目` : '暂无项目数据'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
