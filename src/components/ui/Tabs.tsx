import { ReactNode, useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (key: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(value);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={cn('flex border-b border-gray-100', className)}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
        isActive
          ? 'text-[#165DFF] border-[#165DFF]'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return <div className={cn('animate-in fade-in duration-200', className)}>{children}</div>;
};
