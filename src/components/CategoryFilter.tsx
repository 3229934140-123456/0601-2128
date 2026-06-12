import { BookOpen, Music, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'all' | 'lecture' | 'performance' | 'parent-child';

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

const categories: { key: Category; label: string; icon: any }[] = [
  { key: 'all', label: '全部', icon: null },
  { key: 'lecture', label: '讲座', icon: BookOpen },
  { key: 'performance', label: '演出', icon: Music },
  { key: 'parent-child', label: '亲子', icon: Users },
];

export const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200',
            selected === key
              ? 'bg-[#165DFF] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </button>
      ))}
    </div>
  );
};
