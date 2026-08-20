'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from 'lucide-react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRole } from '@/context/RoleContext';
import { holdsOffice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ResultRecord {
  id: string;
  student_id: string;
  academic_session: string;
  semester: number;
  level: number;
  gpa: number;
  result_slip_url: string | null;
  is_verified: boolean;
  student_name: string;
  matric_number: string | null;
  department: string;
}

export default function ResultVerificationPage() {
  const { profile } = useRole();
  const isAcademicDirector = holdsOffice(profile.executiveOffice, profile.additionalOffices, 'Academic Director');
  const supabase = useMemo(() => createClient(), []);

  const [results, setResults] = useState<ResultRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'ALL' | 'UNVERIFIED' | 'VERIFIED'>('UNVERIFIED');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadResults = async () => {
    setLoading(true);
    setError('');

    const { data, error: resultError } = await supabase
      .from('student_results')
      .select(
        'id, student_id, academic_session, semester, level, gpa, result_slip_url, is_verified'
      )
      .order('is_verified', { ascending: true })
      .order('created_at', { ascending: false });

    if (resultError) {
      setError(resultError.message);
      setResults([]);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const studentIds = [...new Set(rows.map((row) => row.student_id))];

    if (studentIds.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, matric_number, department')
      .in('id', studentIds);

    if (profileError) {
      setError(profileError.message);
      setResults([]);
      setLoading(false);
      return;
    }

    const profileMap = new Map(
      (profiles ?? []).map((student) => [student.id, student])
    );

    setResults(
      rows.map((row) => {
        const student = profileMap.get(row.student_id);
        return {
          id: row.id,
          student_id: row.student_id,
          academic_session: row.academic_session,
          semester: row.semester,
          level: row.level,
          gpa: Number(row.gpa),
          result_slip_url: row.result_slip_url,
          is_verified: Boolean(row.is_verified),
          student_name: student?.full_name ?? 'Unknown student',
          matric_number: student?.matric_number ?? null,
          department: student?.department ?? 'Unknown department',
        };
      })
    );

    setLoading(false);
  };

  useEffect(() => {
    if (isAcademicDirector) loadResults();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAcademicDirector]);

  const filteredResults = results.filter((result) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      result.student_name.toLowerCase().includes(term) ||
      result.department.toLowerCase().includes(term) ||
      (result.matric_number ?? '').toLowerCase().includes(term) ||
      result.academic_session.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VERIFIED' && result.is_verified) ||
      (statusFilter === 'UNVERIFIED' && !result.is_verified);

    return matchesSearch && matchesStatus;
  });

  const handleVerification = async (
    resultId: string,
    verified: boolean
  ) => {
    setWorkingId(resultId);
    setError('');

    const { error: rpcError } = await supabase.rpc(
      'set_result_verification',
      { p_result_id: resultId, p_verified: verified }
    );

    if (rpcError) {
      setError(rpcError.message);
      setWorkingId(null);
      return;
    }

    setResults((current) =>
      current.map((result) =>
        result.id === resultId
          ? { ...result, is_verified: verified }
          : result
      )
    );
    setWorkingId(null);
  };

  if (!isAcademicDirector) {
    return (
      <div className="space-y-6 font-sans">
        <AcademicSubNav />
        <Card className="border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <ShieldCheck className="mx-auto h-8 w-8 text-[#94A3B8]" />
          <h1 className="mt-3 text-base font-extrabold text-[#1F2937]">
            Academic Verification Restricted
          </h1>
          <p className="mt-1 text-xs font-medium text-[#6B7280]">
            This page is available only to the Academic Director.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />
      <div>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#1F2937]">
          <ShieldCheck className="h-5 w-5 text-[#1D4ED8]" />
          Academic Result Verification
        </h1>
        <p className="mt-1 text-xs font-medium text-[#6B7280]">
          Review student semester results and mark official slips as verified after checking the submitted evidence.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student, matric number, department..."
          className="text-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as 'ALL' | 'UNVERIFIED' | 'VERIFIED'
            )
          }
          className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#1F2937]"
        >
          <option value="UNVERIFIED">Unverified first</option>
          <option value="VERIFIED">Verified only</option>
          <option value="ALL">All results</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <Card className="border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#6B7280] shadow-xs">
            Loading result submissions...
          </Card>
        ) : filteredResults.length === 0 ? (
          <Card className="border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center text-xs font-medium text-[#6B7280] shadow-none">
            No result records match the current filters.
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card
              key={result.id}
              className="border-[#E2E8F0] bg-white p-5 shadow-xs"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-extrabold text-[#1F2937]">
                      {result.student_name}
                    </h2>
                    <Badge
                      variant={result.is_verified ? 'emerald' : 'slate'}
                      className="text-[10px]"
                    >
                      {result.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-semibold text-[#6B7280]">
                    {result.matric_number || 'No matric number'} • {result.department}
                  </p>
                  <p className="text-xs font-bold text-[#1D4ED8]">
                    {result.academic_session} • Semester {result.semester} • {result.level}L • GPA {result.gpa.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {result.result_slip_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          result.result_slip_url!,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      className="gap-1.5 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Slip
                    </Button>
                  )}

                  {result.is_verified ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={workingId === result.id}
                      onClick={() => handleVerification(result.id, false)}
                      className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {workingId === result.id ? 'Updating...' : 'Unverify'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={workingId === result.id}
                      onClick={() => handleVerification(result.id, true)}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {workingId === result.id ? 'Verifying...' : 'Verify Result'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
