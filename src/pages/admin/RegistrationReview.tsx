import { useState, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  User as UserIcon,
  Phone,
  Calendar,
  Users,
  AlertTriangle,
  Download,
  Eye,
  Ban,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { useAdminStore } from '@/store/useAdminStore';
import { Registration, RegistrationStatus, User, Activity } from '@/types';
import { formatDateTime } from '@/utils/date';
import { exportToExcel } from '@/utils/export';

const statusMap: Record<RegistrationStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: '待审核', variant: 'warning' },
  approved: { label: '已通过', variant: 'success' },
  rejected: { label: '已拒绝', variant: 'danger' },
  cancelled: { label: '已取消', variant: 'default' },
};

export default function RegistrationReview() {
  const { registrations, activities, users, loadData, reviewRegistration, toggleBlacklist } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const getActivity = (activityId: string) => activities.find(a => a.id === activityId);

  const filteredRegistrations = registrations.filter(reg => {
    const user = getUser(reg.userId);
    const activity = getActivity(reg.activityId);
    const matchesSearch = user?.name.includes(searchTerm) || user?.phone.includes(searchTerm) || activity?.title.includes(searchTerm);
    const matchesActivity = activityFilter === 'all' || reg.activityId === activityFilter;
    const matchesStatus = reg.status === activeTab;
    return matchesSearch && matchesActivity && matchesStatus;
  });

  const handleViewDetail = (reg: Registration) => {
    setSelectedRegistration(reg);
    setSelectedUser(getUser(reg.userId));
    setSelectedActivity(getActivity(reg.activityId));
    setShowDetailModal(true);
  };

  const handleApprove = (id: string) => {
    const reg = registrations.find(r => r.id === id);
    if (!reg || reg.status !== 'pending') return;
    reviewRegistration(id, 'approved');
    if (selectedRegistration?.id === id) {
      setSelectedRegistration({ ...selectedRegistration, status: 'approved', reviewedAt: new Date() });
    }
  };

  const handleReject = (id: string) => {
    const reg = registrations.find(r => r.id === id);
    if (!reg || reg.status !== 'pending') return;
    reviewRegistration(id, 'rejected');
    if (selectedRegistration?.id === id) {
      setSelectedRegistration({ ...selectedRegistration, status: 'rejected', reviewedAt: new Date() });
    }
  };

  const handleToggleBlacklist = (userId: string) => {
    toggleBlacklist(userId);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isBlacklisted: !selectedUser.isBlacklisted });
    }
  };

  const handleExport = () => {
    const exportData = filteredRegistrations.map(reg => {
      const user = getUser(reg.userId);
      const activity = getActivity(reg.activityId);
      return {
        '姓名': user?.name || '',
        '手机号': user?.phone || '',
        '身份证号': user?.idCard || '',
        '活动名称': activity?.title || '',
        '活动时间': activity ? formatDateTime(activity.startTime) : '',
        '报名人数': reg.companionCount + 1,
        '同行人': reg.companionInfo.map(c => c.name).join('、') || '无',
        '报名时间': formatDateTime(reg.createdAt),
        '状态': statusMap[reg.status].label,
      };
    });
    exportToExcel(exportData, '报名名单');
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Source Han Serif SC, serif' }}>
          报名审核
        </h1>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          导出名单
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审核</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已通过</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已拒绝</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索姓名、手机号或活动名称..."
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
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-100 px-4">
            <TabsTrigger value="pending">
              待审核
              {pendingCount > 0 && (
                <Badge variant="warning" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">已通过</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>报名用户</TableHead>
                  <TableHead>活动名称</TableHead>
                  <TableHead>报名人数</TableHead>
                  <TableHead>报名时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => {
                  const user = getUser(reg.userId);
                  const activity = getActivity(reg.activityId);
                  return (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user?.name}
                              {user?.isBlacklisted && (
                                <Badge variant="danger" className="text-xs">黑名单</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user?.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{activity?.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activity && formatDateTime(activity.startTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {reg.companionCount + 1}人
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDateTime(reg.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[reg.status].variant}>
                          {statusMap[reg.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(reg)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {reg.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-500" onClick={() => handleApprove(reg.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleReject(reg.id)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={user.isBlacklisted ? 'text-amber-500' : 'text-gray-500'}
                              onClick={() => handleToggleBlacklist(user.id)}
                              title={user.isBlacklisted ? '移出黑名单' : '加入黑名单'}
                            >
                              {user.isBlacklisted ? <Shield className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRegistrations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      暂无{statusMap[activeTab as RegistrationStatus]?.label}数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      <Modal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedRegistration(null); setSelectedUser(null); }}
        title="报名详情"
      >
        {selectedRegistration && selectedUser && selectedActivity && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-800">用户信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">姓名：</span>
                  <span className="font-medium">{selectedUser.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">手机号：</span>
                  <span className="font-medium">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">身份证号：</span>
                  <span className="font-medium">{selectedUser.idCard}</span>
                </div>
                <div>
                  <span className="text-gray-500">黑名单：</span>
                  <Badge variant={selectedUser.isBlacklisted ? 'danger' : 'success'}>
                    {selectedUser.isBlacklisted ? '是' : '否'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-800">活动信息</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-primary">{selectedActivity.title}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDateTime(selectedActivity.startTime)} - {formatDateTime(selectedActivity.endTime)}
                </div>
                <div className="text-gray-600">地点：{selectedActivity.location}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-800">报名信息</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">报名人数：</span>
                  <span className="font-medium">{selectedRegistration.companionCount + 1}人（含本人）</span>
                </div>
                <div>
                  <span className="text-gray-500">报名时间：</span>
                  <span className="font-medium">{formatDateTime(selectedRegistration.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">状态：</span>
                  <Badge variant={statusMap[selectedRegistration.status].variant}>
                    {statusMap[selectedRegistration.status].label}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedRegistration.companionInfo.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-800">同行人信息</h3>
                <div className="space-y-2">
                  {selectedRegistration.companionInfo.map((companion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="text-gray-500 text-sm">同行人{index + 1}：</span>
                        <span className="font-medium">{companion.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{companion.idCard}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              {selectedRegistration.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={() => handleReject(selectedRegistration.id)}>
                    <X className="w-4 h-4 mr-2" />
                    拒绝
                  </Button>
                  <Button onClick={() => handleApprove(selectedRegistration.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    通过
                  </Button>
                </>
              )}
              {selectedRegistration.status !== 'pending' && (
                <Button onClick={() => setShowDetailModal(false)}>关闭</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
