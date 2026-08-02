'use client';

import React from 'react';
import { InterventionTable } from '@/components/admin/InterventionTable';
import { StudentDirectory } from '@/components/admin/StudentDirectory';
import { ShieldAlert, Users, TrendingDown, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AcademicOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Associate Coordinator Academic Governance & Intervention
        </h1>
        <p className="text-xs text-[#6B7280]">
          Executive analytics dashboard monitoring fellowship CGPA distributions and assigning academic mentors to at-risk brethren before semester exams.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#FF3D4A]" /> Total Tracked Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-[#1F2937]">248</div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">Across 100L - 500L AFIT Engineering</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" /> Flagged At-Risk Brethren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-rose-600">3</div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">Calculated CGPA &lt; 2.50 (Action Required)</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D97706]" /> Verified High-Achieving Mentors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-[#D97706]">42</div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">Seniors with CGPA &gt;= 4.00 Ready to Pair</div>
          </CardContent>
        </Card>
      </div>

      <InterventionTable />
      <StudentDirectory />
    </div>
  );
}
