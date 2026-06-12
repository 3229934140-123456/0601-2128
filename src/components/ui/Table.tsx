import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-gray-50', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-gray-100', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('hover:bg-gray-50 transition-colors', className)} {...props} />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-left font-medium text-gray-600',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  colSpan?: number;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, colSpan, ...props }, ref) => (
    <td ref={ref} colSpan={colSpan} className={cn('px-4 py-3 text-gray-700', className)} {...props} />
  )
);
TableCell.displayName = 'TableCell';
