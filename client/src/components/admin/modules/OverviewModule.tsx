import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, Vote, Activity, RefreshCw, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/components/admin';
import { useUserStore, useProjectStore, useVoteStore } from '@/stores/admin';

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'vote' | 'system';
  message: string;
  timestamp: string;
}

export function OverviewModule() {
  const { stats: userStats, fetchUsers, loading: userLoading } = useUserStore();
  const { stats: projectStats, fetchProjects, loading: projectLoading } = useProjectStore();
  const { stats: voteStats, fetchVotes, loading: voteLoading } = useVoteStore();

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Computed stats from stores
  const currentUserStats = userStats();
  const currentProjectStats = projectStats();
  const currentVoteStats = voteStats();

  const isLoadingStats = userLoading.fetchUsers || projectLoading.fetchProjects || voteLoading.fetchVotes;

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchVotes();
    fetchRecentActivities();
  }, [fetchUsers, fetchProjects, fetchVotes]);

  const fetchRecentActivities = async () => {
    try {
      setIsLoadingActivities(true);
      // Mock recent activities for now
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'user',
          message: '新用户 张三 注册了账户',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '2',
          type: 'project',
          message: '项目 "社区改进提案" 已创建',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: '3',
          type: 'vote',
          message: '用户对项目 "新功能投票" 进行了投票',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '4',
          type: 'system',
          message: '系统完成了定期数据备份',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      ];
      
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchUsers(),
      fetchProjects(),
      fetchVotes(),
      fetchRecentActivities()
    ]);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'project': return <FolderOpen className="h-4 w-4" />;
      case 'vote': return <Vote className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadgeVariant = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user': return 'default';
      case 'project': return 'secondary';
      case 'vote': return 'outline';
      case 'system': return 'destructive';
      default: return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系统概览</h2>
          <p className="text-sm text-gray-600 mt-1">查看系统整体运行状况和最新动态</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoadingStats}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="用户总数"
          value={currentUserStats.total}
          description={`活跃用户: ${currentUserStats.active} | 已封禁: ${currentUserStats.blocked}`}
          icon={<Users className="h-4 w-4" />}
        />

        <StatsCard
          title="项目总数"
          value={currentProjectStats.total}
          description={`进行中: ${currentProjectStats.active} | 已完成: ${currentProjectStats.completed}`}
          icon={<FolderOpen className="h-4 w-4" />}
        />

        <StatsCard
          title="投票总数"
          value={currentVoteStats.total}
          description={`今日新增: ${currentVoteStats.today} | 本周: ${currentVoteStats.thisWeek}`}
          icon={<Vote className="h-4 w-4" />}
        />

        <StatsCard
          title="活跃度"
          value={`${Math.round((currentVoteStats.today / Math.max(currentUserStats.active, 1)) * 100)}%`}
          description="用户参与投票比例"
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            最近活动
          </CardTitle>
          <CardDescription>
            系统最新的用户活动和系统事件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getActivityBadgeVariant(activity.type) as any} className="text-xs">
                        {activity.type === 'user' && '用户'}
                        {activity.type === 'project' && '项目'}
                        {activity.type === 'vote' && '投票'}
                        {activity.type === 'system' && '系统'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">
                      {activity.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
