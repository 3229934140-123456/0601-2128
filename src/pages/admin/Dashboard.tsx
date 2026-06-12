import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Ticket, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateTime } from '@/utils/date';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#165DFF', '#36D399', '#FFAB00', '#F87272'];

export default function Dashboard() {
  const { currentUser } = useAuthStore();
  const { getStatistics, activities, loadData } = useAdminStore();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const stats = getStatistics();
  const todayActivities = activities.filter(a => {
    const today = new Date();
    const activityDate = new Date(a.startTime);
    return activityDate.toDateString() === today.toDateString();
  }).slice(0, 5);

  const quickActions = [
    { label: '活动管理', icon: Calendar, path: '/admin/activities', color: 'blue' },
    { label: '报名审核', icon: Users, path: '/admin/registrations', color: 'green' },
    { label: '签到核销', icon: Ticket, path: '/admin/checkin', color: 'orange' },
    { label: '数据统计', icon: TrendingUp, path: '/admin/statistics', color: 'red' },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif font-bold text-2xl text-gray-900">管理后台</h1>
            <p className="text-gray-500 mt-1">欢迎回来，{currentUser.name}</p>
          </div>
          <Button onClick={() => setRefreshKey(prev => prev + 1)}>
            刷新数据
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="进行中活动"
            value={stats.totalActivities}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
            trend={{ value: 12, isUp: true }}
          />
          <StatCard
            title="总报名人数"
            value={stats.totalRegistrations}
            icon={<Users className="w-6 h-6" />}
            color="green"
            trend={{ value: 8, isUp: true }}
          />
          <StatCard
            title="已核销人数"
            value={stats.totalCheckIns}
            icon={<Ticket className="w-6 h-6" />}
            color="orange"
            trend={{ value: 15, isUp: true }}
          />
          <StatCard
            title="平均到场率"
            value={`${stats.totalRegistrations > 0 ? Math.round((stats.totalCheckIns / stats.totalRegistrations) * 100) : 0}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="red"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.path}
                hoverable
                className="p-5 cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-${action.color}-100`}>
                    <Icon className={`w-6 h-6 text-${action.color}-600`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mt-3">{action.label}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-serif font-semibold text-lg mb-4">近7日报名与核销趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    name="报名人数"
                    stroke="#165DFF"
                    strokeWidth={2}
                    dot={{ fill: '#165DFF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkIns"
                    name="核销人数"
                    stroke="#36D399"
                    strokeWidth={2}
                    dot={{ fill: '#36D399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-serif font-semibold text-lg mb-4">活动类型分布</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-lg">今日活动</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/activities')}>
              查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {todayActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>活动名称</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>地点</TableHead>
                  <TableHead>报名人数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayActivities.map((activity) => {
                  const regCount = stats.topActivities.find(
                    a => a.id === activity.id
                  )?.registrationCount || 0;
                  
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{formatDateTime(activity.startTime)}</TableCell>
                      <TableCell>{activity.location}</TableCell>
                      <TableCell>{regCount} / {activity.totalCapacity}</TableCell>
                      <TableCell>
                        <Badge variant={activity.status === 'published' ? 'success' : 'default'}>
                          {activity.status === 'published' ? '已发布' : '草稿'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/checkin`)}
                        >
                          签到管理
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">今日暂无活动</p>
            </div>
          )}
        </Card>
      </div>
  );
}
