import { ReactNode } from 'react';
import { Card } from './ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isUp: boolean };
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const colorConfig: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
};

export const StatCard = ({ title, value, icon, trend, color = 'blue' }: StatCardProps) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-serif">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.isUp ? 'text-green-500' : 'text-red-500'
            )}>
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}% 较昨日
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br text-white',
          colorConfig[color]
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
