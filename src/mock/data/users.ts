import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张三',
    idCard: '110101199001011234',
    phone: '13800138001',
    role: 'user',
    isBlacklisted: false,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    name: '李四',
    idCard: '110101199502022345',
    phone: '13800138002',
    role: 'user',
    isBlacklisted: false,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'user-3',
    name: '王五',
    idCard: '110101198503033456',
    phone: '13800138003',
    role: 'user',
    isBlacklisted: true,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'admin-1',
    name: '管理员',
    idCard: '110101198001010001',
    phone: '13900139001',
    role: 'admin',
    isBlacklisted: false,
    createdAt: new Date('2023-01-01'),
  },
];
