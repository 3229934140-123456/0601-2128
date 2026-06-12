import { create } from 'zustand';
import { Activity, Registration, Ticket, User, Waitlist } from '@/types';
import { mockApi } from '@/mock';
import { generateId } from '@/utils/validation';

interface AdminState {
  activities: Activity[];
  registrations: Registration[];
  tickets: Ticket[];
  users: User[];
  waitlists: Waitlist[];
  loadData: () => void;
  createActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'remainingCapacity'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  duplicateActivity: (id: string, newStartTime: Date, newEndTime: Date) => Activity | null;
  reviewRegistration: (id: string, status: 'approved' | 'rejected') => void;
  toggleBlacklist: (userId: string) => void;
  checkInTicket: (ticketCode: string) => { success: boolean; message: string; ticket?: Ticket };
  checkInByPhone: (phone: string, activityId: string) => { success: boolean; message: string; ticket?: Ticket };
  getActivityCheckInStats: (activityId: string) => { total: number; checkedIn: number; rate: number };
  getStatistics: () => {
    totalActivities: number;
    totalRegistrations: number;
    totalCheckIns: number;
    categoryStats: { category: string; count: number }[];
    weeklyStats: { date: string; registrations: number; checkIns: number }[];
    topActivities: (Activity & { registrationCount: number })[];
  };
  sendActivityNotice: (activityId: string, notice: string) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activities: mockApi.getActivities(),
  registrations: mockApi.getRegistrations(),
  tickets: mockApi.getTickets(),
  users: mockApi.getUsers(),
  waitlists: mockApi.getWaitlists(),

  loadData: () => {
    set({
      activities: mockApi.getActivities(),
      registrations: mockApi.getRegistrations(),
      tickets: mockApi.getTickets(),
      users: mockApi.getUsers(),
      waitlists: mockApi.getWaitlists(),
    });
  },

  createActivity: (activity) => {
    const { activities } = get();
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      remainingCapacity: activity.totalCapacity,
      createdAt: new Date(),
    };
    const updatedActivities = [...activities, newActivity];
    mockApi.saveActivities(updatedActivities);
    set({ activities: updatedActivities });
    return newActivity;
  },

  updateActivity: (id, updates) => {
    const { activities } = get();
    const updatedActivities = activities.map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    mockApi.saveActivities(updatedActivities);
    set({ activities: updatedActivities });
  },

  deleteActivity: (id) => {
    const { activities } = get();
    const updatedActivities = activities.filter(a => a.id !== id);
    mockApi.saveActivities(updatedActivities);
    set({ activities: updatedActivities });
  },

  duplicateActivity: (id, newStartTime, newEndTime) => {
    const { activities } = get();
    const original = activities.find(a => a.id === id);
    if (!original) return null;
    
    const newActivity: Activity = {
      ...original,
      id: generateId(),
      startTime: newStartTime,
      endTime: newEndTime,
      remainingCapacity: original.totalCapacity,
      status: 'draft',
      notice: undefined,
      createdAt: new Date(),
    };
    
    const updatedActivities = [...activities, newActivity];
    mockApi.saveActivities(updatedActivities);
    set({ activities: updatedActivities });
    return newActivity;
  },

  reviewRegistration: (id, status) => {
    const { registrations } = get();
    const updatedRegistrations = registrations.map(r =>
      r.id === id ? { ...r, status, reviewedAt: new Date() } : r
    );
    mockApi.saveRegistrations(updatedRegistrations);
    set({ registrations: updatedRegistrations });
  },

  toggleBlacklist: (userId) => {
    const { users } = get();
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, isBlacklisted: !u.isBlacklisted } : u
    );
    mockApi.saveUsers(updatedUsers);
    set({ users: updatedUsers });
  },

  checkInTicket: (ticketCode) => {
    const { tickets, registrations, activities } = get();
    const ticket = tickets.find(t => t.qrCode === ticketCode);
    
    if (!ticket) {
      return { success: false, message: '票券不存在' };
    }
    
    if (ticket.status === 'used') {
      return { success: false, message: '票券已使用' };
    }
    
    if (ticket.status === 'cancelled') {
      return { success: false, message: '票券已取消' };
    }
    
    const registration = registrations.find(r => r.id === ticket.registrationId);
    if (!registration || registration.status !== 'approved') {
      return { success: false, message: '报名未审核通过' };
    }
    
    const activity = activities.find(a => a.id === registration.activityId);
    const now = new Date();
    if (activity && now < new Date(activity.startTime.getTime() - 30 * 60 * 1000)) {
      return { success: false, message: '活动开始前30分钟才能签到' };
    }
    
    const updatedTickets = tickets.map(t =>
      t.id === ticket.id ? { ...t, status: 'used' as const, checkedInAt: new Date() } : t
    );
    mockApi.saveTickets(updatedTickets);
    set({ tickets: updatedTickets });
    
    return { success: true, message: '核销成功', ticket: { ...ticket, status: 'used', checkedInAt: new Date() } };
  },

  checkInByPhone: (phone, activityId) => {
    const { tickets, registrations, users } = get();
    const user = users.find(u => u.phone === phone);
    
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    const registration = registrations.find(
      r => r.userId === user.id && r.activityId === activityId && r.status === 'approved'
    );
    
    if (!registration) {
      return { success: false, message: '该用户未报名此活动' };
    }
    
    const ticket = tickets.find(t => t.registrationId === registration.id);
    if (!ticket) {
      return { success: false, message: '票券不存在' };
    }
    
    return get().checkInTicket(ticket.qrCode);
  },

  getActivityCheckInStats: (activityId) => {
    const { tickets, registrations } = get();
    const activityRegs = registrations.filter(
      r => r.activityId === activityId && r.status === 'approved'
    );
    const activityTickets = tickets.filter(t =>
      activityRegs.some(r => r.id === t.registrationId)
    );
    const checkedIn = activityTickets.filter(t => t.status === 'used').length;
    const total = activityTickets.length;
    
    return {
      total,
      checkedIn,
      rate: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    };
  },

  getStatistics: () => {
    const { activities, registrations, tickets } = get();
    
    const categoryMap: Record<string, string> = {
      lecture: '讲座',
      performance: '演出',
      'parent-child': '亲子活动',
    };
    
    const categoryStats = Object.entries(
      registrations.reduce((acc, r) => {
        const activity = activities.find(a => a.id === r.activityId);
        if (activity && r.status === 'approved') {
          acc[activity.category] = (acc[activity.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    ).map(([category, count]) => ({
      category: categoryMap[category] || category,
      count,
    }));
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return date;
    });
    
    const weeklyStats = last7Days.map(date => {
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayRegistrations = registrations.filter(
        r => r.createdAt >= dayStart && r.createdAt <= dayEnd
      ).length;
      
      const dayCheckIns = tickets.filter(
        t => t.checkedInAt && t.checkedInAt >= dayStart && t.checkedInAt <= dayEnd
      ).length;
      
      return { date: dateStr, registrations: dayRegistrations, checkIns: dayCheckIns };
    });
    
    const activityRegCount = activities.map(activity => ({
      ...activity,
      registrationCount: registrations.filter(
        r => r.activityId === activity.id && r.status === 'approved'
      ).length,
    }));
    
    const topActivities = activityRegCount
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, 5);
    
    return {
      totalActivities: activities.filter(a => a.status === 'published').length,
      totalRegistrations: registrations.filter(r => r.status === 'approved').length,
      totalCheckIns: tickets.filter(t => t.status === 'used').length,
      categoryStats,
      weeklyStats,
      topActivities,
    };
  },

  sendActivityNotice: (activityId, notice) => {
    const { activities, registrations } = get();
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const updatedActivities = activities.map(a =>
      a.id === activityId ? { ...a, notice } : a
    );
    mockApi.saveActivities(updatedActivities);
    
    const activityRegs = registrations.filter(
      r => r.activityId === activityId && r.status === 'approved'
    );
    const notifications = mockApi.getNotifications();
    
    activityRegs.forEach(reg => {
      notifications.push({
        id: generateId(),
        userId: reg.userId,
        title: '活动变更通知',
        content: `活动"${activity.title}"有新通知：${notice}`,
        read: false,
        createdAt: new Date(),
      });
    });
    
    mockApi.saveNotifications(notifications);
    set({ activities: updatedActivities });
  },
}));
