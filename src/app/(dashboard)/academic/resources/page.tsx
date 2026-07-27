'use client';

import React from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { ResourceBank } from '@/components/fellowship/ResourceBank';
import { Folder, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AcademicResourcesPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm">
              <Folder className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                AFIT Past Questions & Exam Resource Bank
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                Search and download past examination papers, tutorial problem sets, and solved exam solutions across AFIT departments.
              </p>
            </div>
          </div>
          <Badge variant="blue" className="gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Exam Repository
          </Badge>
        </div>
      </div>

      {/* Academic Sub-Navigation Tabs */}
      <AcademicSubNav />

      {/* Resource Bank Repository */}
      <ResourceBank />
    </div>
  );
}
