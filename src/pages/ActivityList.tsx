import { useState, useMemo } from 'react';
import { Search, Calendar, LayoutGrid, List } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CalendarView } from '@/components/CalendarView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useActivityStore } from '@/store/useActivityStore';
import { Activity, ActivityCategory } from '@/types';
import { isSameDay } from '@/utils/date';

type Category = 'all' | ActivityCategory;
type ViewMode = 'grid' | 'calendar';

export default function ActivityList() {
  const { activities } = useActivityStore();
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredActivities = useMemo(() => {
    let result = [...activities].filter(a => a.status === 'published');

    if (category !== 'all') {
      result = result.filter(a => a.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.location.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    if (selectedDate) {
      result = result.filter(a => isSameDay(new Date(a.startTime), selectedDate));
    }

    result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return result;
  }, [activities, category, searchQuery, selectedDate]);

  const handleDateSelect = (date: Date) => {
    if (selectedDate && isSameDay(date, selectedDate)) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#165DFF] to-[#0E42D2] rounded-2xl p-8 text-white">
          <h1 className="font-serif font-bold text-3xl mb-2">探索精彩文化活动</h1>
          <p className="text-white/80 mb-6">
            发现身边的讲座、演出、亲子活动，开启您的文化之旅
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="搜索活动名称、地点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white text-gray-900 placeholder-gray-400 border-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <CategoryFilter selected={category} onChange={setCategory} />
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              列表视图
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              日历视图
            </Button>
          </div>
        </div>

        {selectedDate && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-[#165DFF]" />
            <span className="text-sm text-gray-700">
              已筛选 {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} 的活动
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(undefined)}
              className="ml-auto"
            >
              清除筛选
            </Button>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">暂无活动</h3>
                <p className="text-gray-500">请尝试其他筛选条件或稍后再来查看</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CalendarView
                activities={activities.filter(a => a.status === 'published')}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {selectedDate ? '当天暂无活动' : '暂无活动'}
                    </h3>
                    <p className="text-gray-500">请选择其他日期或稍后再来查看</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
