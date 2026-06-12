export const validateIdCard = (idCard: string): boolean => {
  if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)) {
    return false;
  }
  
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return idCard[17].toUpperCase() === checkCode;
};

export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validateName = (name: string): boolean => {
  return /^[\u4e00-\u9fa5·]{2,20}$/.test(name);
};

export const validateAge = (age: number, minAge: number, maxAge: number): boolean => {
  return age >= minAge && age <= maxAge;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateTicketCode = (activityId: string, userId: string): string => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TICKET-${activityId.toUpperCase()}-${userId.toUpperCase()}-${dateStr}-${random}`;
};

export const maskIdCard = (idCard: string): string => {
  if (idCard.length !== 18) return idCard;
  return idCard.slice(0, 6) + '********' + idCard.slice(14);
};

export const maskPhone = (phone: string): string => {
  if (phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
};

export const calculateAge = (idCard: string): number => {
  if (idCard.length !== 18) return 0;
  const birthYear = parseInt(idCard.slice(6, 10));
  const birthMonth = parseInt(idCard.slice(10, 12));
  const birthDay = parseInt(idCard.slice(12, 14));
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  return Math.max(0, age);
};
