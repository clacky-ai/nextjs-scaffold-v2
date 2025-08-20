import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FolderOpen,
  Vote,
  UserCheck,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStatisticsStore } from '@/stores/admin/statisticsStore';

// 模拟最近活动数据
const recentActivities = [
  {
    id: 1,
    type: 'project',
    message: '用户 张三 提交了新项目 "AI智能助手"',
    time: '2分钟前',
    icon: FolderOpen,
    color: 'text-blue-500',
  },
  {
    id: 2,
    type: 'vote',
    message: '用户 李四 为项目 "区块链投票系统" 投票',
    time: '5分钟前',
    icon: Vote,
    color: 'text-green-500',
  },
  {
    id: 3,
    type: 'user',
    message: '新用户 王五 完成注册',
    time: '8分钟前',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    id: 4,
    type: 'project',
    message: '项目 "智能家居系统" 获得新投票',
    time: '12分钟前',
    icon: Vote,
    color: 'text-orange-500',
  },
  {
    id: 5,
    type: 'alert',
    message: '检测到可疑投票行为，需要审核',
    time: '15分钟前',
    icon: AlertCircle,
    color: 'text-red-500',
  },
];

export function Dashboard() {
  const {
    dashboardStats,
    loading,
    fetchDashboardStats,
  } = useStatisticsStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading.fetchDashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">加载数据中...</p>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">暂无数据</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              系统用户总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{dashboardStats.pendingProjects}</span> 待审核
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总投票数</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              平均每项目 {dashboardStats.totalProjects > 0 ? Math.round(dashboardStats.totalVotes / dashboardStats.totalProjects) : 0} 票
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与率</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.participationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeUsers} 活跃用户
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              系统概览
            </CardTitle>
            <CardDescription>
              关键指标和系统状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">投票完成率</span>
                <span className="text-sm text-muted-foreground">{dashboardStats.completionRate}%</span>
              </div>
              <Progress value={dashboardStats.completionRate} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">平均评分</span>
                <span className="text-sm text-muted-foreground">{dashboardStats.avgScore}/5.0</span>
              </div>
              <Progress value={dashboardStats.avgScore * 20} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">用户活跃度</span>
                <span className="text-sm text-muted-foreground">{Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100)}%</span>
              </div>
              <Progress value={(dashboardStats.activeUsers / dashboardStats.totalUsers) * 100} className="w-full" />
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.activeUsers}</div>
                  <div className="text-xs text-muted-foreground">活跃用户</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{dashboardStats.pendingProjects}</div>
                  <div className="text-xs text-muted-foreground">待审核项目</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              最近活动
            </CardTitle>
            <CardDescription>
              系统最新动态和操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type === 'project' && '项目'}
                      {activity.type === 'vote' && '投票'}
                      {activity.type === 'user' && '用户'}
                      {activity.type === 'alert' && '警告'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            今日数据
          </CardTitle>
          <CardDescription>
            今日系统使用情况统计
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-blue-600">新增投票</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-green-600">新增项目</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-purple-600">新增用户</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-orange-600">活跃会话</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
