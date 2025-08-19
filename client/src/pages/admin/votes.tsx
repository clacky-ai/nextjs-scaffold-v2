import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Vote, User, FolderOpen, Trash2, MessageSquare } from 'lucide-react';
import { AdminLayout, AdminPageLayout, DataTable, Column } from '@/components/admin';
import { useVoteStore } from '@/stores/admin';
import { Vote as VoteType } from '@/stores/admin/types';

export default function AdminVotesPage() {
  const { 
    filteredVotes, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    fetchVotes, 
    deleteVote,
    refreshData 
  } = useVoteStore();

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleDeleteVote = async (voteId: string) => {
    const success = await deleteVote(voteId);
    
    if (success) {
      console.log('投票记录已删除');
    } else {
      console.error('删除投票记录失败');
    }
  };

  const columns: Column<VoteType>[] = [
    {
      key: 'userName',
      title: '投票用户',
      render: (value) => (
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900 font-medium">{value}</span>
        </div>
      ),
      width: '150px'
    },
    {
      key: 'projectTitle',
      title: '投票项目',
      render: (value) => (
        <div className="flex items-center text-sm">
          <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900 font-medium truncate">{value}</span>
        </div>
      ),
      width: '200px'
    },
    {
      key: 'reason',
      title: '投票理由',
      render: (value) => (
        <div className="max-w-xs">
          {value ? (
            <div className="flex items-start text-sm">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-900 line-clamp-3">{value}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">未填写理由</span>
          )}
        </div>
      ),
      width: '300px'
    },
    {
      key: 'createdAt',
      title: '投票时间',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
      width: '150px'
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, record) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={loading.deleteVote}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除投票记录</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除用户 <strong>{record.userName}</strong> 对项目 <strong>{record.projectTitle}</strong> 的投票记录吗？
                <br />
                <br />
                此操作不可撤销，删除后该投票记录将永久消失。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteVote(record.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
      width: '80px',
      align: 'center'
    }
  ];

  return (
    <AdminLayout>
      <AdminPageLayout
        title="投票管理"
        description="管理系统中的所有投票记录"
      >
        <DataTable
          columns={columns}
          data={filteredVotes()}
          loading={loading.fetchVotes}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={refreshData}
          emptyText="暂无投票记录"
        />
      </AdminPageLayout>
    </AdminLayout>
  );
}
