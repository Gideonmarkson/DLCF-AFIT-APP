'use client';

import React from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { DynamicResultTable } from '@/components/academic/DynamicResultTable';
import { ShieldCheck, Lock, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ResultUploadPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm">
              <Calculator className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                Confidential Semester Result Slip Upload & CGPA Calculator
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                Log your semester grades, compute your GPA/CGPA, and upload official AFIT result slip proof securely under database RLS protection.
              </p>
            </div>
          </div>
          <Badge variant="blue" className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8]" /> Restricted RLS Security
          </Badge>
        </div>
      </div>

      {/* Academic Sub-Navigation Tabs */}
      <AcademicSubNav />

      {/* Dynamic Result Logger Component */}
      <DynamicResultTable initialCgpa={4.25} initialUnits={45} />
    </div>
  );
}
