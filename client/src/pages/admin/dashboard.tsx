import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, Vote, Activity, RefreshCw, BarChart3 } from 'lucide-react';
import { AdminLayout, AdminPageLayout, StatsCard } from '@/components/admin';
import { useUserStore, useProjectStore, useVoteStore } from '@/stores/admin';
import { useIsAdminAuthenticated, useAdminAuthLoading } from '@/stores/admin/authStore';

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'vote' | 'system';
  message: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const isAuthenticated = useIsAdminAuthenticated();
  const isLoading = useAdminAuthLoading();

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

  useEffect(() => {
    // 如果未认证，跳转到登录页
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin/login');
      return;
    }

    // 如果已认证，加载数据
    if (isAuthenticated) {
      fetchUsers();
      fetchProjects();
      fetchVotes();
      fetchRecentActivities();
    }
  }, [isAuthenticated, isLoading, setLocation, fetchUsers, fetchProjects, fetchVotes]);

  const fetchRecentActivities = async () => {
    try {
      setIsLoadingActivities(true);
      // Mock recent activities for now
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'system',
          message: '系统正常运行',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'user',
          message: '新用户注册',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '3',
          type: 'project',
          message: '新项目提交',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: '4',
          type: 'vote',
          message: '新投票记录',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString()
        }
      ];

      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchProjects();
    fetchVotes();
    fetchRecentActivities();
  };

  // 如果未认证，显示空白页面（路由会处理重定向）
  if (!isAuthenticated) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'project': return <FolderOpen className="h-4 w-4" />;
      case 'vote': return <Vote className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'vote': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <AdminLayout>
      <AdminPageLayout
        title="概览"
        description="系统概览和统计信息"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        }
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="用户总数"
            value={currentUserStats.total}
            description={`活跃用户: ${currentUserStats.active} | 已封禁: ${currentUserStats.blocked}`}
            icon={<Users className="h-4 w-4" />}
          />

          <StatsCard
            title="项目总数"
            value={currentProjectStats.total}
            description={`活跃项目: ${currentProjectStats.active} | 已封禁: ${currentProjectStats.blocked}`}
            icon={<FolderOpen className="h-4 w-4" />}
          />

          <StatsCard
            title="投票总数"
            value={currentVoteStats.total}
            description={`今日投票: ${currentVoteStats.todayVotes}`}
            icon={<Vote className="h-4 w-4" />}
          />

          <StatsCard
            title="平均投票数"
            value={currentVoteStats.averageVotesPerProject}
            description="每个项目的平均投票数"
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
              系统最近的活动记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                加载中...
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无活动记录
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AdminPageLayout>
    </AdminLayout>
  );
}
