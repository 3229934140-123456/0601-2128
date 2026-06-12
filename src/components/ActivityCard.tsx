import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Activity } from '@/types';
import { formatDateTime, formatTime } from '@/utils/date';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  lecture: { label: '讲座', color: 'info' },
  performance: { label: '演出', color: 'success' },
  'parent-child': { label: '亲子', color: 'warning' },
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const category = categoryConfig[activity.category];
  const ticketPercentage = (activity.remainingCapacity / activity.totalCapacity) * 100;
  const isLowTicket = ticketPercentage <= 10 && ticketPercentage > 0;
  const isSoldOut = activity.remainingCapacity <= 0;

  return (
    <Link to={`/activity/${activity.id}`}>
      <Card hoverable className="h-full flex flex-col group">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={category.color as any}>{category.label}</Badge>
            {activity.notice && (
              <Badge variant="danger">有变更</Badge>
            )}
          </div>
          {isLowTicket && (
            <div className="absolute top-3 right-3">
              <Badge variant="danger" className="animate-pulse">
                即将售罄
              </Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg font-serif line-clamp-2">
              {activity.title}
            </h3>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#165DFF]" />
              <span>{formatDateTime(activity.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#165DFF]" />
              <span>约 {Math.round((activity.endTime.getTime() - activity.startTime.getTime()) / 60000)} 分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#165DFF]" />
              <span className="line-clamp-1">{activity.location}</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {isSoldOut ? '已满员' : `剩余 ${activity.remainingCapacity} 票`}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {activity.minAge}-{activity.maxAge}岁
              </span>
            </div>
            
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isSoldOut ? 'bg-gray-400' : isLowTicket ? 'bg-[#E34D59]' : 'bg-[#165DFF]'
                )}
                style={{ width: `${100 - ticketPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
