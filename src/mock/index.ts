import { User, Activity, Registration, Ticket, Waitlist, Review, Notification } from '@/types';
import { mockUsers } from './data/users';
import { mockActivities } from './data/activities';
import { mockRegistrations } from './data/registrations';
import { mockTickets } from './data/tickets';
import { mockWaitlists } from './data/waitlists';
import { mockReviews } from './data/reviews';

const STORAGE_KEYS = {
  users: 'culture_ticket_users',
  activities: 'culture_ticket_activities',
  registrations: 'culture_ticket_registrations',
  tickets: 'culture_ticket_tickets',
  waitlists: 'culture_ticket_waitlists',
  reviews: 'culture_ticket_reviews',
  notifications: 'culture_ticket_notifications',
  currentUser: 'culture_ticket_current_user',
};

const parseDates = <T>(data: any): T => {
  if (Array.isArray(data)) {
    return data.map(item => parseDates(item)) as T;
  }
  if (data && typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (key.includes('At') || key.includes('Time') || key === 'createdAt') {
        result[key] = data[key] ? new Date(data[key]) : null;
      } else {
        result[key] = parseDates(data[key]);
      }
    }
    return result as T;
  }
  return data as T;
};

const initializeData = <T>(key: string, mockData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return parseDates<T>(JSON.parse(stored));
    } catch {
      return mockData;
    }
  }
  localStorage.setItem(key, JSON.stringify(mockData));
  return mockData;
};

const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockApi = {
  getUsers: (): User[] => initializeData(STORAGE_KEYS.users, mockUsers),
  saveUsers: (users: User[]) => saveData(STORAGE_KEYS.users, users),
  
  getActivities: (): Activity[] => initializeData(STORAGE_KEYS.activities, mockActivities),
  saveActivities: (activities: Activity[]) => saveData(STORAGE_KEYS.activities, activities),
  
  getRegistrations: (): Registration[] => initializeData(STORAGE_KEYS.registrations, mockRegistrations),
  saveRegistrations: (registrations: Registration[]) => saveData(STORAGE_KEYS.registrations, registrations),
  
  getTickets: (): Ticket[] => initializeData(STORAGE_KEYS.tickets, mockTickets),
  saveTickets: (tickets: Ticket[]) => saveData(STORAGE_KEYS.tickets, tickets),
  
  getWaitlists: (): Waitlist[] => initializeData(STORAGE_KEYS.waitlists, mockWaitlists),
  saveWaitlists: (waitlists: Waitlist[]) => saveData(STORAGE_KEYS.waitlists, waitlists),
  
  getReviews: (): Review[] => initializeData(STORAGE_KEYS.reviews, mockReviews),
  saveReviews: (reviews: Review[]) => saveData(STORAGE_KEYS.reviews, reviews),
  
  getNotifications: (): Notification[] => initializeData(STORAGE_KEYS.notifications, []),
  saveNotifications: (notifications: Notification[]) => saveData(STORAGE_KEYS.notifications, notifications),
  
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
    return stored ? parseDates<User>(JSON.parse(stored)) : null;
  },
  
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  },
  
  resetData: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
