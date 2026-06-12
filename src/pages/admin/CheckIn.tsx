import { useState, useEffect } from 'react';
import {
  QrCode,
  Search,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
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
import { Ticket, TicketStatus } from '@/types';
import { formatDateTime, formatTime } from '@/utils/date';

const statusMap: Record<TicketStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  unused: { label: '未使用', variant: 'default' },
  used: { label: '已核销', variant: 'success' },
  cancelled: { label: '已取消', variant: 'danger' },
  expired: { label: '已过期', variant: 'warning' },
};

export default function CheckIn() {
  const { activities, tickets, registrations, users, loadData, checkInTicket, checkInByPhone, getActivityCheckInStats } = useAdminStore();
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [ticketCode, setTicketCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getActivity = (activityId: string) => activities.find(a => a.id === activityId);
  const getRegistration = (regId: string) => registrations.find(r => r.id === regId);
  const getUser = (userId: string) => users.find(u => u.id === userId);

  const todayActivities = activities.filter(a => {
    const today = new Date();
    const activityDate = new Date(a.startTime);
    return activityDate.toDateString() === today.toDateString() && a.status === 'published';
  });

  const filteredTickets = tickets.filter(t => {
    const reg = getRegistration(t.registrationId);
    if (!reg) return false;
    return selectedActivity === 'all' || reg.activityId === selectedActivity;
  }).sort((a, b) => {
    if (a.status === 'used' && b.status !== 'used') return -1;
    if (a.status !== 'used' && b.status === 'used') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleScanCheckIn = () => {
    if (!ticketCode.trim()) return;
    const result = checkInTicket(ticketCode.trim());
    setCheckInResult(result);
    setTicketCode('');
    setTimeout(() => setCheckInResult(null), 3000);
  };

  const handlePhoneCheckIn = () => {
    if (!phoneNumber.trim() || selectedActivity === 'all') {
      setCheckInResult({ success: false, message: '请先选择活动并输入手机号' });
      setTimeout(() => setCheckInResult(null), 3000);
      return;
    }
    const result = checkInByPhone(phoneNumber.trim(), selectedActivity);
    setCheckInResult(result);
    setPhoneNumber('');
    setTimeout(() => setCheckInResult(null), 3000);
  };

  const currentActivity = selectedActivity !== 'all' ? getActivity(selectedActivity) : null;
  const stats = currentActivity ? getActivityCheckInStats(currentActivity.id) : null;

  const usedCount = filteredTickets.filter(t => t.status === 'used').length;
  const totalCount = filteredTickets.filter(t => t.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Source Han Serif SC, serif' }}>
          签到核销
        </h1>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="all">所有活动</option>
            {todayActivities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      {stats && currentActivity && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总报名人数</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已核销</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">到场率</p>
                <p className="text-2xl font-bold text-amber-600">{stats.rate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="scan">
              <QrCode className="w-4 h-4 mr-2" />
              扫码核销
            </TabsTrigger>
            <TabsTrigger value="phone">
              <Phone className="w-4 h-4 mr-2" />
              手机号查询
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">使用扫码枪或手动输入票券编号</p>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="请输入票券编号或扫描二维码"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanCheckIn()}
                  icon={<QrCode className="w-4 h-4" />}
                  autoFocus
                />
                <Button className="w-full" onClick={handleScanCheckIn} disabled={!ticketCode.trim()}>
                  核销
                </Button>
              </div>

              {checkInResult && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  checkInResult.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {checkInResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={checkInResult.success ? 'text-green-700' : 'text-red-700'}>
                    {checkInResult.message}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="phone">
            <div className="max-w-md mx-auto space-y-6">
              {selectedActivity === 'all' && (
                <div className="p-4 bg-amber-50 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <span className="text-amber-700">请先选择要核销的活动</span>
                </div>
              )}

              {currentActivity && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium">{currentActivity.title}</p>
                  <p className="text-blue-600 text-sm flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(currentActivity.startTime)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  placeholder="请输入用户手机号"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneCheckIn()}
                  icon={<Phone className="w-4 h-4" />}
                  disabled={selectedActivity === 'all'}
                />
                <Button
                  className="w-full"
                  onClick={handlePhoneCheckIn}
                  disabled={!phoneNumber.trim() || selectedActivity === 'all'}
                >
                  查询并核销
                </Button>
              </div>

              {checkInResult && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  checkInResult.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {checkInResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={checkInResult.success ? 'text-green-700' : 'text-red-700'}>
                    {checkInResult.message}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-800">核销记录</h2>
          <div className="text-sm text-gray-500">
            已核销：{usedCount} / {totalCount}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>票券编号</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>活动</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>核销时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => {
              const reg = getRegistration(ticket.registrationId);
              const activity = reg ? getActivity(reg.activityId) : null;
              const user = reg ? getUser(reg.userId) : null;
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">{ticket.qrCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-xs text-gray-500">{user?.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{activity?.title}</div>
                    <div className="text-xs text-gray-500">
                      {activity && formatTime(activity.startTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[ticket.status].variant}>
                      {statusMap[ticket.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {ticket.checkedInAt ? formatDateTime(ticket.checkedInAt) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  暂无核销记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
