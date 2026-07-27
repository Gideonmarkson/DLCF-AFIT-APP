import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF3D4A] focus:outline-none focus:ring-2 focus:ring-[#FF3D4A]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
