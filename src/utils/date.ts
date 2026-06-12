import { format, parseISO, differenceInYears, isBefore, isAfter } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date | string, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

export const formatMonthDay = (date: Date | string): string => {
  return formatDate(date, 'MM月dd日');
};

export const formatWeekday = (date: Date | string): string => {
  return formatDate(date, 'EEEE');
};

export const calculateAge = (idCard: string): number | null => {
  if (idCard.length !== 18) return null;
  const birthYear = parseInt(idCard.slice(6, 10));
  const birthMonth = parseInt(idCard.slice(10, 12)) - 1;
  const birthDay = parseInt(idCard.slice(12, 14));
  const birthDate = new Date(birthYear, birthMonth, birthDay);
  return differenceInYears(new Date(), birthDate);
};

export const isActivityUpcoming = (startTime: Date | string): boolean => {
  const d = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  return isAfter(d, new Date());
};

export const isActivityEnded = (endTime: Date | string): boolean => {
  const d = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  return isBefore(d, new Date());
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
