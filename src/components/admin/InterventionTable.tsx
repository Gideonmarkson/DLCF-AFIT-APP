'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MentorAssignModal } from './MentorAssignModal';
import { createClient } from '@/lib/supabase/client';
import { AFIT_DEPARTMENTS } from '@/lib/constants';
import { useRole } from '@/context/RoleContext';

export interface FlaggedStudent {
  id: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
  cgpa: number;
  mentorName?: string;
  mentorLevel?: string;
  hasSlipOnFile: boolean;
  slipVerified: boolean;
}

const OTHER_DEPARTMENT_VALUE = 'OTHER';

export function InterventionTable() {
  const { profile } = useRole();
  const canAssignMentors = profile.executiveOffice === 'Academic Director';

  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [customDepartment, setCustomDepartment] = useState('');
  const [flaggedStudents, setFlaggedStudents] = useState<FlaggedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<FlaggedStudent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, matric_number, department, current_level, cgpa')
      .eq('role', 'GENERAL_STUDENT')
      .lt('cgpa', 2.5)
      .gt('cgpa', 0)
      .order('cgpa', { ascending: true });

    const ids = (students ?? []).map((s) => s.id);

    const mentorByStudent = new Map<string, { name: string; level: string }>();
    const slipByStudent = new Map<string, { onFile: boolean; verified: boolean }>();

    if (ids.length > 0) {
      const [{ data: pairings }, { data: results }] = await Promise.all([
        supabase.from('mentor_pairings').select('student_id, mentor_id').in('student_id', ids),
        supabase
          .from('student_results')
          .select('student_id, result_slip_url, is_verified, created_at')
          .in('student_id', ids)
          .order('created_at', { ascending: false }),
      ]);

      const mentorIds = Array.from(new Set((pairings ?? []).map((p) => p.mentor_id)));
      if (mentorIds.length > 0) {
        const { data: mentors } = await supabase
          .from('profiles')
          .select('id, full_name, current_level')
          .in('id', mentorIds);
        const mentorById = new Map((mentors ?? []).map((m) => [m.id, m]));
        for (const p of pairings ?? []) {
          const mentor = mentorById.get(p.mentor_id);
          if (mentor) {
            mentorByStudent.set(p.student_id, {
              name: mentor.full_name ?? 'Unnamed',
              level: mentor.current_level ? `${mentor.current_level}` : '—',
            });
          }
        }
      }

      // Results are ordered newest first, so the first row seen per student is their latest.
      for (const r of results ?? []) {
        if (!slipByStudent.has(r.student_id)) {
          slipByStudent.set(r.student_id, {
            onFile: !!r.result_slip_url,
            verified: !!r.is_verified && !!r.result_slip_url,
          });
        }
      }
    }

    setFlaggedStudents(
      (students ?? []).map((p) => ({
        id: p.id,
        fullName: p.full_name ?? 'Unnamed',
        matricNumber: p.matric_number ?? '—',
        department: p.department ?? '—',
        level: p.current_level ? `${p.current_level}` : '—',
        cgpa: p.cgpa ?? 0,
        mentorName: mentorByStudent.get(p.id)?.name,
        mentorLevel: mentorByStudent.get(p.id)?.level,
        hasSlipOnFile: slipByStudent.get(p.id)?.onFile ?? false,
        slipVerified: slipByStudent.get(p.id)?.verified ?? false,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedCustomDept = customDepartment.trim().toLowerCase();

  const filteredStudents = flaggedStudents.filter((std) => {
    if (departmentFilter === 'ALL') return true;
    if (departmentFilter === OTHER_DEPARTMENT_VALUE) {
      if (!normalizedCustomDept) return true;
      return std.department.toLowerCase().includes(normalizedCustomDept);
    }
    return std.department === departmentFilter;
  });

  const columnCount = canAssignMentors ? 7 : 6;

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-[#1F2937]">
            Academic Intervention Queue
            <span className="ml-1.5 font-semibold text-[#6B7280]">
              ({loading ? '…' : filteredStudents.length} at risk)
            </span>
          </h3>
          <p className="text-xs text-[#6B7280]">
            Brethren with a calculated CGPA below 2.50.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              if (e.target.value !== OTHER_DEPARTMENT_VALUE) setCustomDepartment('');
            }}
            className="text-xs font-semibold sm:w-64"
          >
            <option value="ALL">All AFIT departments</option>
            {AFIT_DEPARTMENTS.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
            <option value={OTHER_DEPARTMENT_VALUE}>Other (type a department)…</option>
          </Select>
          {departmentFilter === OTHER_DEPARTMENT_VALUE && (
            <Input
              value={customDepartment}
              onChange={(e) => setCustomDepartment(e.target.value)}
              placeholder="Type a department..."
              className="text-xs sm:w-56"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Flagged Students Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Matric No.</TableHead>
            <TableHead>Department & Level</TableHead>
            <TableHead>CGPA</TableHead>
            <TableHead>Result Slip</TableHead>
            <TableHead>Mentorship Status</TableHead>
            {canAssignMentors && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="text-center text-xs text-[#6B7280] py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="text-center text-xs text-[#6B7280] py-6">
                No students match this filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents.map((std) => (
              <TableRow key={std.id}>
                <TableCell className="font-bold text-[#1F2937]">{std.fullName}</TableCell>
                <TableCell className="font-mono text-xs text-[#6B7280] font-semibold">{std.matricNumber}</TableCell>
                <TableCell className="text-xs font-medium">
                  {std.department} <span className="text-[#6B7280]">({std.level}L)</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-rose-700">{std.cgpa.toFixed(2)}</span>
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  {std.hasSlipOnFile ? (
                    <span className={std.slipVerified ? 'text-emerald-700' : 'text-[#4B5563]'}>
                      {std.slipVerified ? 'On file · verified' : 'On file'}
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF] font-medium">Not uploaded</span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  {std.mentorName ? (
                    <span className="text-emerald-700">
                      {std.mentorName}
                      {std.mentorLevel && std.mentorLevel !== '—' ? ` (${std.mentorLevel}L)` : ''}
                    </span>
                  ) : (
                    <span className="text-amber-700">Unassigned</span>
                  )}
                </TableCell>
                {canAssignMentors && (
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={std.mentorName ? 'outline' : 'primary'}
                      onClick={() => setSelectedStudent(std)}
                      className="text-xs"
                    >
                      {std.mentorName ? 'Reassign' : 'Assign mentor'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Mentor Assignment Modal — Academic Director only, writes a real mentor_pairings row */}
      {selectedStudent && canAssignMentors && (
        <MentorAssignModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onPaired={() => {
            setSelectedStudent(null);
            load();
          }}
        />
      )}
    </div>
  );
}
