import { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAdminStore } from '@/store/useAdminStore';
import { Waitlist, WaitlistStatus } from '@/types';
import { formatDateTime } from '@/utils/date';

const statusMap: Record<WaitlistStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  waiting: { label: '等待中', variant: 'warning' },
  notified: { label: '已通知', variant: 'default' },
  confirmed: { label: '已确认', variant: 'success' },
  cancelled: { label: '已取消', variant: 'danger' },
};

export default function WaitlistManagement() {
  const { activities, waitlists, users, loadData } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('waiting');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getActivity = (activityId: string) => activities.find(a => a.id === activityId);
  const getUser = (userId: string) => users.find(u => u.id === userId);

  const activitiesWithWaitlist = activities.filter(a =>
    waitlists.some(w => w.activityId === a.id)
  );

  const filteredWaitlists = waitlists.filter(w => {
    const user = getUser(w.userId);
    const activity = getActivity(w.activityId);
    const matchesSearch = user?.name.includes(searchTerm) || activity?.title.includes(searchTerm);
    const matchesActivity = activityFilter === 'all' || w.activityId === activityFilter;
    const matchesStatus = w.status === activeTab;
    return matchesSearch && matchesActivity && matchesStatus;
  }).sort((a, b) => {
    if (a.activityId !== b.activityId) {
      return new Date(getActivity(b.activityId)?.startTime || 0).getTime() - new Date(getActivity(a.activityId)?.startTime || 0).getTime();
    }
    return a.position - b.position;
  });

  const groupedByActivity = filteredWaitlists.reduce((acc, w) => {
    if (!acc[w.activityId]) {
      acc[w.activityId] = [];
    }
    acc[w.activityId].push(w);
    return acc;
  }, {} as Record<string, Waitlist[]>);

  const waitingCount = waitlists.filter(w => w.status === 'waiting').length;
  const notifiedCount = waitlists.filter(w => w.status === 'notified').length;
  const confirmedCount = waitlists.filter(w => w.status === 'confirmed').length;

  const handleNotify = (waitlistId: string) => {
    alert(`已发送候补通知给用户！`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Source Han Serif SC, serif' }}>
          候补管理
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">等待中</p>
              <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已通知</p>
              <p className="text-2xl font-bold text-blue-600">{notifiedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已确认</p>
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索用户名或活动名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px]"
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
          >
            <option value="all">所有活动</option>
            {activitiesWithWaitlist.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-100 px-4">
            <TabsTrigger value="waiting">
              等待中
              {waitingCount > 0 && (
                <Badge variant="warning" className="ml-2">{waitingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notified">已通知</TabsTrigger>
            <TabsTrigger value="confirmed">已确认</TabsTrigger>
            <TabsTrigger value="cancelled">已取消</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="p-0">
            {Object.entries(groupedByActivity).length > 0 ? (
              Object.entries(groupedByActivity).map(([activityId, lists]) => {
                const activity = getActivity(activityId);
                if (!activity) return null;
                return (
                  <div key={activityId} className="border-b border-gray-100 last:border-b-0">
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{formatDateTime(activity.startTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">剩余名额</p>
                          <p className="font-medium text-primary">{activity.remainingCapacity}/{activity.totalCapacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">候补人数</p>
                          <p className="font-medium text-amber-600">{lists.length}人</p>
                        </div>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">排队号</TableHead>
                          <TableHead>用户信息</TableHead>
                          <TableHead>候补时间</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>通知时间</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lists.map((w) => {
                          const user = getUser(w.userId);
                          return (
                            <TableRow key={w.id}>
                              <TableCell>
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                  w.position === 1 ? 'bg-amber-100 text-amber-700' :
                                  w.position === 2 ? 'bg-gray-100 text-gray-700' :
                                  w.position === 3 ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-50 text-gray-600'
                                }`}>
                                  {w.position}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{user?.name}</div>
                                    <div className="text-sm text-gray-500">{user?.phone}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatDateTime(w.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusMap[w.status].variant}>
                                  {statusMap[w.status].label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {w.notifiedAt ? formatDateTime(w.notifiedAt) : '-'}
                              </TableCell>
                              <TableCell>
                                {w.status === 'waiting' && activity.remainingCapacity > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNotify(w.id)}
                                  >
                                    <Bell className="w-4 h-4 mr-2" />
                                    通知
                                  </Button>
                                )}
                                {w.status === 'waiting' && activity.remainingCapacity === 0 && (
                                  <div className="flex items-center gap-1 text-sm text-gray-400">
                                    <AlertCircle className="w-4 h-4" />
                                    暂无名额
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无{statusMap[activeTab as WaitlistStatus]?.label}的候补记录</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
