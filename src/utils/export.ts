import * as XLSX from 'xlsx';
import { Registration, User } from '@/types';
import { formatDateTime } from './date';
import { maskIdCard, maskPhone } from './validation';

interface ExportRegistration {
  序号: number;
  姓名: string;
  手机号: string;
  身份证号: string;
  同行人数: number;
  同行人信息: string;
  报名时间: string;
  状态: string;
}

export const exportRegistrationsToExcel = (
  registrations: Registration[],
  users: User[],
  filename: string = '报名名单.xlsx'
) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消',
  };

  const userMap = new Map(users.map(u => [u.id, u]));

  const data: ExportRegistration[] = registrations.map((reg, index) => {
    const user = userMap.get(reg.userId);
    const companionInfo = reg.companionInfo
      .map(c => `${c.name}(${maskIdCard(c.idCard)})`)
      .join('; ');

    return {
      序号: index + 1,
      姓名: user?.name || '未知',
      手机号: user ? maskPhone(user.phone) : '未知',
      身份证号: user ? maskIdCard(user.idCard) : '未知',
      同行人数: reg.companionCount,
      同行人信息: companionInfo || '无',
      报名时间: formatDateTime(reg.createdAt),
      状态: statusMap[reg.status] || reg.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '报名名单');

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 40 },
    { wch: 20 },
    { wch: 10 },
  ];

  XLSX.writeFile(workbook, filename);
};

export const exportToExcel = (data: Record<string, any>[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, filename);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
