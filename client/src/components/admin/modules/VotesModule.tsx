import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Vote, User, FolderOpen, Trash2, MessageSquare } from 'lucide-react';
import { DataTable, Column } from '@/components/admin';
import { useVoteStore } from '@/stores/admin';
import { Vote as VoteType } from '@/stores/admin/types';

export function VotesModule() {
  const { votes, fetchVotes, deleteVote, isLoading } = useVoteStore();

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleDeleteVote = async (voteId: string) => {
    try {
      await deleteVote(voteId);
      await fetchVotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete vote:', error);
    }
  };

  const columns: Column<VoteType>[] = [
    {
      key: 'id',
      title: '投票ID',
      render: (vote) => (
        <div className="flex items-center space-x-2">
          <Vote className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-mono text-gray-900">{vote.id.slice(0, 8)}...</span>
        </div>
      )
    },
    {
      key: 'user',
      title: '投票用户',
      render: (vote) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{vote.user?.name || '未知用户'}</span>
        </div>
      )
    },
    {
      key: 'project',
      title: '投票项目',
      render: (vote) => (
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{vote.project?.title || '未知项目'}</span>
        </div>
      )
    },
    {
      key: 'comment',
      title: '评论',
      render: (vote) => vote.comment ? (
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 max-w-xs truncate" title={vote.comment}>
            {vote.comment}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">无评论</span>
      )
    },
    {
      key: 'createdAt',
      title: '投票时间',
      render: (vote) => (
        <span className="text-sm text-gray-500">
          {new Date(vote.createdAt).toLocaleString('zh-CN')}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (vote) => (
        <div className="flex items-center space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除投票</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除这条投票记录吗？此操作无法撤销。
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
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">投票管理</h2>
        <p className="text-sm text-gray-600 mt-1">管理系统中的所有投票记录</p>
      </div>

      {/* Data Table */}
      <DataTable
        data={votes}
        columns={columns}
        loading={isLoading.fetchVotes}
        emptyMessage="暂无投票数据"
      />
    </div>
  );
}
