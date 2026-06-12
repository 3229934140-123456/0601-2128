import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Send,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
import { Activity, ActivityCategory, ActivityStatus } from '@/types';
import { formatDateTime } from '@/utils/date';
import { exportToExcel } from '@/utils/export';

const categoryMap: Record<ActivityCategory, string> = {
  lecture: '讲座',
  performance: '演出',
  'parent-child': '亲子活动',
};

const statusMap: Record<ActivityStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: '草稿', variant: 'default' },
  published: { label: '已发布', variant: 'success' },
  ended: { label: '已结束', variant: 'warning' },
  cancelled: { label: '已取消', variant: 'danger' },
};

export default function ActivityManagement() {
  const { activities, loadData, createActivity, updateActivity, deleteActivity, duplicateActivity, sendActivityNotice } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    category: 'lecture' as ActivityCategory,
    startTime: '',
    endTime: '',
    location: '',
    totalCapacity: 50,
    minAge: 0,
    maxAge: 100,
    status: 'draft' as ActivityStatus,
  });
  const [duplicateData, setDuplicateData] = useState({
    startTime: '',
    endTime: '',
  });
  const [noticeContent, setNoticeContent] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.includes(searchTerm) || activity.description.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateSubmit = () => {
    createActivity({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    });
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditSubmit = () => {
    if (selectedActivity) {
      updateActivity(selectedActivity.id, {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
      });
      setShowEditModal(false);
      resetForm();
    }
  };

  const handleDuplicateSubmit = () => {
    if (selectedActivity) {
      duplicateActivity(
        selectedActivity.id,
        new Date(duplicateData.startTime),
        new Date(duplicateData.endTime)
      );
      setShowDuplicateModal(false);
      setDuplicateData({ startTime: '', endTime: '' });
    }
  };

  const handleSendNotice = () => {
    if (selectedActivity && noticeContent.trim()) {
      sendActivityNotice(selectedActivity.id, noticeContent.trim());
      setShowNoticeModal(false);
      setNoticeContent('');
    }
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      coverImage: activity.coverImage,
      category: activity.category,
      startTime: new Date(activity.startTime).toISOString().slice(0, 16),
      endTime: new Date(activity.endTime).toISOString().slice(0, 16),
      location: activity.location,
      totalCapacity: activity.totalCapacity,
      minAge: activity.minAge,
      maxAge: activity.maxAge,
      status: activity.status,
    });
    setShowEditModal(true);
  };

  const handleDuplicate = (activity: Activity) => {
    setSelectedActivity(activity);
    const nextWeek = new Date(activity.startTime);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(activity.endTime);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    setDuplicateData({
      startTime: nextWeek.toISOString().slice(0, 16),
      endTime: nextWeekEnd.toISOString().slice(0, 16),
    });
    setShowDuplicateModal(true);
  };

  const handleNotice = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowNoticeModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      coverImage: '',
      category: 'lecture',
      startTime: '',
      endTime: '',
      location: '',
      totalCapacity: 50,
      minAge: 0,
      maxAge: 100,
      status: 'draft',
    });
    setSelectedActivity(null);
  };

  const handleExport = () => {
    const exportData = filteredActivities.map(a => ({
      '活动名称': a.title,
      '类型': categoryMap[a.category],
      '开始时间': formatDateTime(a.startTime),
      '结束时间': formatDateTime(a.endTime),
      '地点': a.location,
      '总容量': a.totalCapacity,
      '剩余名额': a.remainingCapacity,
      '年龄限制': `${a.minAge}-${a.maxAge}岁`,
      '状态': statusMap[a.status].label,
    }));
    exportToExcel(exportData, '活动列表');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Source Han Serif SC, serif' }}>
          活动管理
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            导出列表
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建活动
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索活动名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ActivityCategory | 'all')}
          >
            <option value="all">所有类型</option>
            <option value="lecture">讲座</option>
            <option value="performance">演出</option>
            <option value="parent-child">亲子活动</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | 'all')}
          >
            <option value="all">所有状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="ended">已结束</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>活动名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>地点</TableHead>
              <TableHead>名额</TableHead>
              <TableHead>年龄限制</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{categoryMap[activity.category]}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(activity.startTime)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{activity.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className={activity.remainingCapacity < activity.totalCapacity * 0.1 ? 'text-red-500 font-medium' : ''}>
                      {activity.remainingCapacity}/{activity.totalCapacity}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {activity.minAge}-{activity.maxAge}岁
                </TableCell>
                <TableCell>
                  <Badge variant={statusMap[activity.status].variant}>
                    {statusMap[activity.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(activity)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleNotice(activity)}>
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteActivity(activity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredActivities.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  暂无活动数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="创建活动"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动名称</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入活动名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动类型</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ActivityCategory })}
            >
              <option value="lecture">讲座</option>
              <option value="performance">演出</option>
              <option value="parent-child">亲子活动</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图片URL</label>
            <Input
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="请输入封面图片链接"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入活动地点"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">总容量</label>
              <Input
                type="number"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最小年龄</label>
              <Input
                type="number"
                value={formData.minAge}
                onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大年龄</label>
              <Input
                type="number"
                value={formData.maxAge}
                onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动状态</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入活动描述"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              取消
            </Button>
            <Button onClick={handleCreateSubmit}>创建</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="编辑活动"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动名称</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动类型</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ActivityCategory })}
            >
              <option value="lecture">讲座</option>
              <option value="performance">演出</option>
              <option value="parent-child">亲子活动</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">总容量</label>
              <Input
                type="number"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最小年龄</label>
              <Input
                type="number"
                value={formData.minAge}
                onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大年龄</label>
              <Input
                type="number"
                value={formData.maxAge}
                onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动状态</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
              <option value="ended">结束</option>
              <option value="cancelled">取消</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
              取消
            </Button>
            <Button onClick={handleEditSubmit}>保存</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDuplicateModal}
        onClose={() => { setShowDuplicateModal(false); setSelectedActivity(null); }}
        title="复制场次"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              将复制活动：<span className="font-medium">{selectedActivity?.title}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新场次开始时间</label>
              <Input
                type="datetime-local"
                value={duplicateData.startTime}
                onChange={(e) => setDuplicateData({ ...duplicateData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新场次结束时间</label>
              <Input
                type="datetime-local"
                value={duplicateData.endTime}
                onChange={(e) => setDuplicateData({ ...duplicateData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowDuplicateModal(false); setSelectedActivity(null); }}>
              取消
            </Button>
            <Button onClick={handleDuplicateSubmit}>复制</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showNoticeModal}
        onClose={() => { setShowNoticeModal(false); setSelectedActivity(null); setNoticeContent(''); }}
        title="发送活动通知"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-700">
              通知将发送给所有已报名" <span className="font-medium">{selectedActivity?.title}</span> "的用户
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通知内容</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px]"
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="请输入通知内容..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowNoticeModal(false); setSelectedActivity(null); setNoticeContent(''); }}>
              取消
            </Button>
            <Button onClick={handleSendNotice} disabled={!noticeContent.trim()}>
              发送通知
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
