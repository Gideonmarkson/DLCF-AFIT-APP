import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'gold' | 'role' | 'emerald' | 'rose' | 'slate' | 'amber' | 'cyan' | 'red';
}

export function Badge({ className, variant = 'blue', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]/20',
    blue: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]/30 font-bold',
    red: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]/30 font-bold',
    cyan: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]/30 font-bold',
    gold: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] font-bold',
    amber: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] font-bold',
    role: 'bg-[#1D4ED8] text-white font-extrabold border-transparent shadow-xs',
    emerald: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] font-bold',
    rose: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
    slate: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
