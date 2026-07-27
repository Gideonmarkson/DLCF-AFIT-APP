'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, TrendingUp, Upload, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CGPAGaugeCardProps {
  cgpa?: number;
  lastUpdated?: string;
  isUnderperforming?: boolean;
}

export function CGPAGaugeCard({ cgpa = 4.25, lastUpdated = '2024/2025 Semester 1', isUnderperforming = false }: CGPAGaugeCardProps) {
  const percentage = Math.min(100, (cgpa / 5.0) * 100);

  return (
    <Card className="relative overflow-hidden border-[#E5E7EB] bg-white shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp className="w-28 h-28 text-[#FF3D4A]" />
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#FF3D4A]" />
            Confidential Academic Metric
          </CardTitle>
          <Badge variant={isUnderperforming ? 'rose' : 'gold'}>
            {isUnderperforming ? 'Intervention Flagged' : 'Good Standing'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Last verified for {lastUpdated}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-[#1F2937]">
            {cgpa.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-[#6B7280]">/ 5.00 CGPA</span>
        </div>

        {/* Gauge bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-[#F3F4F6] rounded-full overflow-hidden p-0.5 border border-[#E5E7EB]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnderperforming ? 'bg-rose-500' : 'bg-gradient-to-r from-[#FF3D4A] to-[#D97706]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6B7280] font-mono font-medium">
            <span>0.00</span>
            <span>2.50 (Probation)</span>
            <span>5.00 (First Class)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-1 text-[11px] text-[#6B7280] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF3D4A]" />
            Associate Coordinator Eyes Only
          </div>
          <Link href="/academic/results/upload">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-[#FF3D4A] text-[#FF3D4A]">
              <Upload className="w-3.5 h-3.5 text-[#FF3D4A]" /> Upload Slip
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
