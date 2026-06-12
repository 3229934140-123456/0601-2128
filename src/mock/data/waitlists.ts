import { Waitlist } from '@/types';

export const mockWaitlists: Waitlist[] = [
  {
    id: 'wait-1',
    userId: 'user-1',
    activityId: 'act-3',
    position: 1,
    status: 'waiting',
    createdAt: new Date('2026-06-10'),
  },
  {
    id: 'wait-2',
    userId: 'user-2',
    activityId: 'act-3',
    position: 2,
    status: 'waiting',
    createdAt: new Date('2026-06-11'),
  },
];
