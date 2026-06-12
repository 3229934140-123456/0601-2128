import { create } from 'zustand';
import { Activity, Registration, Ticket, Waitlist, Review, Companion } from '@/types';
import { mockApi } from '@/mock';
import { generateId, generateTicketCode, calculateAge, validateAge } from '@/utils/validation';

interface ActivityState {
  activities: Activity[];
  registrations: Registration[];
  tickets: Ticket[];
  waitlists: Waitlist[];
  reviews: Review[];
  loadData: () => void;
  getActivityById: (id: string) => Activity | undefined;
  registerActivity: (
    activityId: string,
    userId: string,
    name: string,
    idCard: string,
    companionInfo: Companion[]
  ) => Promise<{ success: boolean; message: string; ticket?: Ticket }>;
  cancelRegistration: (registrationId: string) => Promise<boolean>;
  joinWaitlist: (activityId: string, userId: string) => Promise<boolean>;
  leaveWaitlist: (waitlistId: string) => void;
  confirmWaitlistRegistration: (waitlistId: string) => Promise<{ success: boolean; message: string }>;
  addReview: (activityId: string, userId: string, rating: number, content: string) => void;
  getReviewsByActivity: (activityId: string) => Review[];
  getUserRegistrations: (userId: string) => Registration[];
  getUserTickets: (userId: string) => (Ticket & { activity?: Activity; registration?: Registration })[];
  getUserWaitlists: (userId: string) => (Waitlist & { activity?: Activity })[];
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: mockApi.getActivities(),
  registrations: mockApi.getRegistrations(),
  tickets: mockApi.getTickets(),
  waitlists: mockApi.getWaitlists(),
  reviews: mockApi.getReviews(),

  loadData: () => {
    set({
      activities: mockApi.getActivities(),
      registrations: mockApi.getRegistrations(),
      tickets: mockApi.getTickets(),
      waitlists: mockApi.getWaitlists(),
      reviews: mockApi.getReviews(),
    });
  },

  getActivityById: (id: string) => {
    return get().activities.find(a => a.id === id);
  },

  registerActivity: async (activityId, userId, name, idCard, companionInfo) => {
    const { activities, registrations, tickets } = get();
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      return { success: false, message: '活动不存在' };
    }

    const totalPeople = 1 + companionInfo.length;
    
    if (activity.remainingCapacity < totalPeople) {
      return { success: false, message: `余票不足，需要 ${totalPeople} 个名额，当前仅剩 ${activity.remainingCapacity} 个名额` };
    }
    
    const existingReg = registrations.find(
      r => r.activityId === activityId && r.userId === userId && r.status !== 'cancelled'
    );
    if (existingReg) {
      return { success: false, message: '您已报名该活动' };
    }
    
    const age = calculateAge(idCard);
    if (age !== null && !validateAge(age, activity.minAge, activity.maxAge)) {
      return { 
        success: false, 
        message: `年龄不符合要求，该活动适合${activity.minAge}-${activity.maxAge}岁人群参加` 
      };
    }
    
    for (const companion of companionInfo) {
      const compAge = calculateAge(companion.idCard);
      if (compAge !== null && !validateAge(compAge, activity.minAge, activity.maxAge)) {
        return { 
          success: false, 
          message: `同行人${companion.name}年龄不符合要求，该活动适合${activity.minAge}-${activity.maxAge}岁人群参加` 
        };
      }
    }
    
    const users = mockApi.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], name, idCard };
      mockApi.saveUsers(users);
    }
    
    const registration: Registration = {
      id: generateId(),
      userId,
      activityId,
      status: 'approved',
      companionCount: companionInfo.length,
      companionInfo,
      createdAt: new Date(),
      reviewedAt: new Date(),
    };
    
    const ticket: Ticket = {
      id: generateId(),
      registrationId: registration.id,
      qrCode: generateTicketCode(activityId, userId),
      status: 'unused',
      createdAt: new Date(),
    };
    
    const updatedRegistrations = [...registrations, registration];
    const updatedTickets = [...tickets, ticket];
    const updatedActivities = activities.map(a =>
      a.id === activityId
        ? { ...a, remainingCapacity: a.remainingCapacity - 1 - companionInfo.length }
        : a
    );
    
    mockApi.saveRegistrations(updatedRegistrations);
    mockApi.saveTickets(updatedTickets);
    mockApi.saveActivities(updatedActivities);
    
    set({
      registrations: updatedRegistrations,
      tickets: updatedTickets,
      activities: updatedActivities,
    });
    
    return { success: true, message: '报名成功', ticket };
  },

  cancelRegistration: async (registrationId) => {
    const { registrations, tickets, activities, waitlists } = get();
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration || registration.status === 'cancelled') {
      return false;
    }
    
    const activity = activities.find(a => a.id === registration.activityId);
    if (!activity) return false;
    
    const releasedCount = 1 + registration.companionCount;
    
    const updatedRegistrations = registrations.map(r =>
      r.id === registrationId ? { ...r, status: 'cancelled' as const } : r
    );
    
    const updatedTickets = tickets.map(t =>
      t.registrationId === registrationId ? { ...t, status: 'cancelled' as const } : t
    );
    
    let updatedActivities = activities.map(a =>
      a.id === registration.activityId
        ? { ...a, remainingCapacity: a.remainingCapacity + releasedCount }
        : a
    );
    
    const activityWaitlists = waitlists
      .filter(w => w.activityId === registration.activityId && w.status === 'waiting')
      .sort((a, b) => a.position - b.position);
    
    let remainingSlots = releasedCount;
    const updatedWaitlists = [...waitlists];
    const notifications = mockApi.getNotifications();
    
    for (const waitlist of activityWaitlists) {
      if (remainingSlots <= 0) break;
      
      const idx = updatedWaitlists.findIndex(w => w.id === waitlist.id);
      if (idx !== -1) {
        updatedWaitlists[idx] = { ...updatedWaitlists[idx], status: 'notified' as const, notifiedAt: new Date() };
        
        notifications.push({
          id: generateId(),
          userId: waitlist.userId,
          title: '候补名额释放通知',
          content: `您候补的活动"${activity.title}"有名额释放，请在24小时内确认报名。`,
          read: false,
          createdAt: new Date(),
        });
        
        remainingSlots--;
      }
    }
    
    mockApi.saveRegistrations(updatedRegistrations);
    mockApi.saveTickets(updatedTickets);
    mockApi.saveActivities(updatedActivities);
    mockApi.saveWaitlists(updatedWaitlists);
    mockApi.saveNotifications(notifications);
    
    set({
      registrations: updatedRegistrations,
      tickets: updatedTickets,
      activities: updatedActivities,
      waitlists: updatedWaitlists,
    });
    
    return true;
  },

  joinWaitlist: async (activityId, userId) => {
    const { waitlists, activities } = get();
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity || activity.remainingCapacity > 0) {
      return false;
    }
    
    const existingWait = waitlists.find(
      w => w.activityId === activityId && w.userId === userId && w.status !== 'cancelled'
    );
    if (existingWait) {
      return false;
    }
    
    const maxPosition = Math.max(
      0,
      ...waitlists.filter(w => w.activityId === activityId).map(w => w.position)
    );
    
    const newWaitlist: Waitlist = {
      id: generateId(),
      userId,
      activityId,
      position: maxPosition + 1,
      status: 'waiting',
      createdAt: new Date(),
    };
    
    const updatedWaitlists = [...waitlists, newWaitlist];
    mockApi.saveWaitlists(updatedWaitlists);
    set({ waitlists: updatedWaitlists });
    
    return true;
  },

  leaveWaitlist: (waitlistId) => {
    const { waitlists } = get();
    const updatedWaitlists = waitlists.map(w =>
      w.id === waitlistId ? { ...w, status: 'cancelled' as const } : w
    );
    mockApi.saveWaitlists(updatedWaitlists);
    set({ waitlists: updatedWaitlists });
  },

  confirmWaitlistRegistration: async (waitlistId) => {
    const { waitlists, activities, registrations, tickets } = get();
    const waitlist = waitlists.find(w => w.id === waitlistId);
    
    if (!waitlist || waitlist.status !== 'notified') {
      return { success: false, message: '候补状态不正确，无法确认报名' };
    }
    
    const activity = activities.find(a => a.id === waitlist.activityId);
    if (!activity) {
      return { success: false, message: '活动不存在' };
    }
    
    if (activity.remainingCapacity <= 0) {
      return { success: false, message: '活动已满员' };
    }
    
    const users = mockApi.getUsers();
    const user = users.find(u => u.id === waitlist.userId);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    const existingReg = registrations.find(
      r => r.activityId === waitlist.activityId && r.userId === waitlist.userId && r.status !== 'cancelled'
    );
    if (existingReg) {
      return { success: false, message: '您已报名该活动' };
    }
    
    const registration: Registration = {
      id: generateId(),
      userId: waitlist.userId,
      activityId: waitlist.activityId,
      status: 'approved',
      companionCount: 0,
      companionInfo: [],
      createdAt: new Date(),
      reviewedAt: new Date(),
    };
    
    const ticket: Ticket = {
      id: generateId(),
      registrationId: registration.id,
      qrCode: generateTicketCode(waitlist.activityId, waitlist.userId),
      status: 'unused',
      createdAt: new Date(),
    };
    
    const updatedWaitlists = waitlists.map(w =>
      w.id === waitlistId ? { ...w, status: 'confirmed' as const, confirmedAt: new Date() } : w
    );
    
    const updatedRegistrations = [...registrations, registration];
    const updatedTickets = [...tickets, ticket];
    const updatedActivities = activities.map(a =>
      a.id === waitlist.activityId
        ? { ...a, remainingCapacity: a.remainingCapacity - 1 }
        : a
    );
    
    mockApi.saveWaitlists(updatedWaitlists);
    mockApi.saveRegistrations(updatedRegistrations);
    mockApi.saveTickets(updatedTickets);
    mockApi.saveActivities(updatedActivities);
    
    set({
      waitlists: updatedWaitlists,
      registrations: updatedRegistrations,
      tickets: updatedTickets,
      activities: updatedActivities,
    });
    
    return { success: true, message: '候补确认成功，电子票已生成' };
  },

  addReview: (activityId, userId, rating, content) => {
    const { reviews } = get();
    const newReview: Review = {
      id: generateId(),
      userId,
      activityId,
      rating,
      content,
      createdAt: new Date(),
    };
    const updatedReviews = [...reviews, newReview];
    mockApi.saveReviews(updatedReviews);
    set({ reviews: updatedReviews });
  },

  getReviewsByActivity: (activityId) => {
    return get().reviews.filter(r => r.activityId === activityId);
  },

  getUserRegistrations: (userId) => {
    return get().registrations.filter(r => r.userId === userId);
  },

  getUserTickets: (userId) => {
    const { tickets, registrations, activities } = get();
    const userRegs = registrations.filter(r => r.userId === userId);
    return tickets
      .filter(t => userRegs.some(r => r.id === t.registrationId))
      .map(t => ({
        ...t,
        registration: registrations.find(r => r.id === t.registrationId),
        activity: activities.find(a => a.id === registrations.find(r => r.id === t.registrationId)?.activityId),
      }));
  },

  getUserWaitlists: (userId) => {
    const { waitlists, activities } = get();
    return waitlists
      .filter(w => w.userId === userId)
      .map(w => ({
        ...w,
        activity: activities.find(a => a.id === w.activityId),
      }));
  },
}));
