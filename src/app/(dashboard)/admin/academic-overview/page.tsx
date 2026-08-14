'use client';

import React, { useEffect, useState } from 'react';
import { InterventionTable } from '@/components/admin/InterventionTable';
import { StudentDirectory } from '@/components/admin/StudentDirectory';
import { Users, TrendingDown, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface OverviewStats {
  totalTracked: number;
  atRisk: number;
  eligibleMentors: number;
}

export default function AcademicOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient();
      const [totalRes, atRiskRes, mentorsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .in('role', ['GENERAL_STUDENT', 'STUDENT_EXECUTIVE']),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'GENERAL_STUDENT')
          .lt('cgpa', 2.5)
          .gt('cgpa', 0),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .in('role', ['GENERAL_STUDENT', 'STUDENT_EXECUTIVE'])
          .gte('cgpa', 4.0),
      ]);
      setStats({
        totalTracked: totalRes.count ?? 0,
        atRisk: atRiskRes.count ?? 0,
        eligibleMentors: mentorsRes.count ?? 0,
      });
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937]">Exco Governance Queue</h1>
        <p className="text-xs text-[#6B7280]">
          Fellowship CGPA monitoring and mentor pairing for brethren who need academic support.
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
            <div className="text-3xl font-extrabold font-mono text-[#1F2937]">
              {stats ? stats.totalTracked : '—'}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">General students & executives on record</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" /> Flagged At-Risk Brethren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-rose-600">
              {stats ? stats.atRisk : '—'}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">Calculated CGPA &lt; 2.50</div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D97706]" /> Eligible Mentors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-[#D97706]">
              {stats ? stats.eligibleMentors : '—'}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 font-medium">Students &amp; executives with CGPA &gt;= 4.00</div>
          </CardContent>
        </Card>
      </div>

      <InterventionTable />
      <StudentDirectory />
    </div>
  );
}
