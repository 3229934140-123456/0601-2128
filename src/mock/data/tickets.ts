import { Ticket } from '@/types';

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    registrationId: 'reg-1',
    qrCode: 'TICKET-ACT1-USER1-20260615-001',
    status: 'unused',
    createdAt: new Date('2026-05-20'),
  },
  {
    id: 'ticket-2',
    registrationId: 'reg-2',
    qrCode: 'TICKET-ACT2-USER2-20260618-002',
    status: 'unused',
    createdAt: new Date('2026-05-25'),
  },
  {
    id: 'ticket-3',
    registrationId: 'reg-5',
    qrCode: 'TICKET-ACT1-USER2-20260615-003',
    status: 'used',
    checkedInAt: new Date('2026-06-15T09:25:00'),
    createdAt: new Date('2026-06-01'),
  },
];
