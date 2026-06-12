import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Activity } from '@/types';
import { getDaysInMonth, isSameDay, formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  activities: Activity[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const CalendarView = ({ activities, onDateSelect, selectedDate }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => isSameDay(new Date(activity.startTime), date));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-serif font-semibold text-lg">
          {year}年{month + 1}月
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map(date => {
          const dayActivities = getActivitiesForDate(date);
          const hasActivities = dayActivities.length > 0;
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200',
                'hover:bg-gray-50',
                isSelected && 'bg-[#165DFF] text-white hover:bg-[#0E42D2]',
                isToday && !isSelected && 'ring-2 ring-[#165DFF] ring-inset',
                hasActivities && !isSelected && 'text-[#165DFF] font-medium'
              )}
            >
              <span className="text-sm">{date.getDate()}</span>
              {hasActivities && (
                <div className="flex gap-0.5 mt-1">
                  {dayActivities.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-white' : 'bg-[#165DFF]'
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {formatDate(selectedDate, 'MM月dd日 EEEE')} 活动
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getActivitiesForDate(selectedDate).length > 0 ? (
              getActivitiesForDate(selectedDate).map(activity => (
                <div
                  key={activity.id}
                  onClick={() => onDateSelect(selectedDate)}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.startTime, 'HH:mm')} · {activity.location}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">暂无活动</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
