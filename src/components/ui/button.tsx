import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs';

    const variants = {
      primary: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-[#1D4ED8]/20 hover:shadow-[#1D4ED8]/30',
      secondary: 'bg-white hover:bg-[#EFF6FF] text-[#1D4ED8] border border-[#E2E8F0]',
      outline: 'bg-white border border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]',
      ghost: 'bg-transparent hover:bg-[#EFF6FF] text-[#1F2937] hover:text-[#1D4ED8]',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
