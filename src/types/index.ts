export interface User {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  role: 'user' | 'admin';
  isBlacklisted: boolean;
  createdAt: Date;
}

export type ActivityCategory = 'lecture' | 'performance' | 'parent-child';
export type ActivityStatus = 'draft' | 'published' | 'ended' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: ActivityCategory;
  startTime: Date;
  endTime: Date;
  location: string;
  totalCapacity: number;
  remainingCapacity: number;
  minAge: number;
  maxAge: number;
  status: ActivityStatus;
  notice?: string;
  createdAt: Date;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Companion {
  name: string;
  idCard: string;
}

export interface Registration {
  id: string;
  userId: string;
  activityId: string;
  status: RegistrationStatus;
  companionCount: number;
  companionInfo: Companion[];
  createdAt: Date;
  reviewedAt?: Date;
}

export type TicketStatus = 'unused' | 'used' | 'cancelled' | 'expired';

export interface Ticket {
  id: string;
  registrationId: string;
  qrCode: string;
  status: TicketStatus;
  checkedInAt?: Date;
  createdAt: Date;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'confirmed' | 'cancelled';

export interface Waitlist {
  id: string;
  userId: string;
  activityId: string;
  position: number;
  status: WaitlistStatus;
  createdAt: Date;
  notifiedAt?: Date;
}

export interface Review {
  id: string;
  userId: string;
  activityId: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
}
