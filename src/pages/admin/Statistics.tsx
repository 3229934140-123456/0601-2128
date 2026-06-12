import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Ticket,
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { useAdminStore } from '@/store/useAdminStore';
import { ActivityCategory } from '@/types';
import { formatDateTime } from '@/utils/date';
import { exportToExcel } from '@/utils/export';

const COLORS = ['#165DFF', '#E34D59', '#FFB020', '#36D399', '#6366F1'];

const categoryMap: Record<ActivityCategory, string> = {
  lecture: '讲座',
  performance: '演出',
  'parent-child': '亲子活动',
};

export default function Statistics() {
  const { activities, registrations, tickets, loadData, getStatistics } = useAdminStore();
  const [stats, setStats] = useState<ReturnType<typeof getStatistics> | null>(null);

  useEffect(() => {
    loadData();
    setStats(getStatistics());
  }, [loadData, getStatistics]);

  const handleRefresh = () => {
    loadData();
    setStats(getStatistics());
  };

  const handleExport = () => {
    if (!stats) return;
    const exportData = [
      { '统计项': '活动总数', '数值': stats.totalActivities },
      { '统计项': '报名总数', '数值': stats.totalRegistrations },
      { '统计项': '核销总数', '数值': stats.totalCheckIns },
      {},
      { '统计项': '活动类型分布', '数值': '' },
      ...stats.categoryStats.map(s => ({ '统计项': s.category, '数值': s.count })),
      {},
      { '统计项': '热门活动排名', '数值': '' },
      ...stats.topActivities.map((a, i) => ({ '统计项': `${i + 1}. ${a.title}`, '数值': a.registrationCount })),
    ];
    exportToExcel(exportData, '数据统计');
  };

  const attendanceRate = stats ? (stats.totalRegistrations > 0 ? Math.round((stats.totalCheckIns / stats.totalRegistrations) * 100) : 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Source Han Serif SC, serif' }}>
          数据统计
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <BarChart3 className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活动总数</p>
              <p className="text-3xl font-bold text-primary">{stats?.totalActivities || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+12%</span>
            <span className="text-gray-400 ml-2">较上月</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">报名总数</p>
              <p className="text-3xl font-bold text-amber-600">{stats?.totalRegistrations || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+8%</span>
            <span className="text-gray-400 ml-2">较上月</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">核销总数</p>
              <p className="text-3xl font-bold text-green-600">{stats?.totalCheckIns || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Ticket className="w-7 h-7 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+15%</span>
            <span className="text-gray-400 ml-2">较上月</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均到场率</p>
              <p className="text-3xl font-bold text-purple-600">{attendanceRate}%</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              近7日报名与核销趋势
            </h3>
          </div>
          <div className="h-72">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyStats}>
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165DFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36D399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#36D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="报名人数"
                    stroke="#165DFF"
                    strokeWidth={2}
                    fill="url(#colorRegistrations)"
                  />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    name="核销人数"
                    stroke="#36D399"
                    strokeWidth={2}
                    fill="url(#colorCheckIns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              活动类型分布
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats && stats.categoryStats.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              活动类型报名统计
            </h3>
          </div>
          <div className="h-72">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="#9CA3AF"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" name="报名人数" radius={[0, 4, 4, 0]}>
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              日报名趋势
            </h3>
          </div>
          <div className="h-72">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    name="报名人数"
                    stroke="#165DFF"
                    strokeWidth={3}
                    dot={{ fill: '#165DFF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            热门活动排行 TOP 5
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">排名</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>报名人数</TableHead>
              <TableHead>容量</TableHead>
              <TableHead>报名率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats?.topActivities.map((activity, index) => {
              const rate = activity.totalCapacity > 0
                ? Math.round((activity.registrationCount / activity.totalCapacity) * 100)
                : 0;
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoryMap[activity.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDateTime(activity.startTime)}
                  </TableCell>
                  <TableCell className="font-medium text-primary">{activity.registrationCount}</TableCell>
                  <TableCell className="text-gray-600">{activity.totalCapacity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            rate >= 90 ? 'bg-red-500' :
                            rate >= 70 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!stats?.topActivities || stats.topActivities.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
