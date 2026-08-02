'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Eye, ShieldAlert, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { MentorAssignModal } from './MentorAssignModal';
import { createClient } from '@/lib/supabase/client';

export interface FlaggedStudent {
  id: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
  cgpa: number;
  assignedMentorName?: string;
  isSlipUploaded: boolean;
}


export function InterventionTable() {
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [flaggedStudents, setFlaggedStudents] = useState<FlaggedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<FlaggedStudent | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, matric_number, department, current_level, cgpa')
        .eq('role', 'GENERAL_STUDENT')
        .lt('cgpa', 2.5)
        .gt('cgpa', 0);
      setFlaggedStudents(
        (data ?? []).map((p) => ({
          id: p.id,
          fullName: p.full_name ?? 'Unnamed',
          matricNumber: p.matric_number ?? '—',
          department: p.department ?? '—',
          level: p.current_level ?? '—',
          cgpa: p.cgpa ?? 0,
          isSlipUploaded: false,
        }))
      );
    };
    load();
  }, []);

  const filteredStudents = flaggedStudents.filter((std) => {
    if (departmentFilter === 'ALL') return true;
    return std.department === departmentFilter;
  });

  const handleMentorAssigned = (mentorName: string) => {
    if (selectedStudent) {
      setFlaggedStudents(
        flaggedStudents.map((s) => (s.id === selectedStudent.id ? { ...s, assignedMentorName: mentorName } : s))
      );
    }
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
              Academic Intervention Queue
              <Badge variant="rose">{filteredStudents.length} Students At-Risk</Badge>
            </h3>
            <p className="text-xs text-[#6B7280]">
              Restricted View: Students with calculated CGPA &lt; 2.50 requiring executive mentorship assignment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="text-xs font-semibold">
            <option value="ALL">All AFIT Departments</option>
            <option value="Aeronautical Engineering">Aeronautical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </Select>
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
            <TableHead>Result Slip Proof</TableHead>
            <TableHead>Mentorship Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((std) => (
            <TableRow key={std.id}>
              <TableCell className="font-bold text-[#1F2937]">{std.fullName}</TableCell>
              <TableCell className="font-mono text-xs text-[#6B7280] font-semibold">{std.matricNumber}</TableCell>
              <TableCell className="text-xs font-medium">
                {std.department} <span className="text-[#6B7280]">({std.level}L)</span>
              </TableCell>
              <TableCell>
                <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg text-xs">
                  {std.cgpa.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                {std.isSlipUploaded ? (
                  <Badge variant="emerald" className="gap-1">
                    <Eye className="w-3 h-3" /> Slip Verified
                  </Badge>
                ) : (
                  <Badge variant="slate">Manual Log</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs font-semibold">
                {std.assignedMentorName ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> {std.assignedMentorName}
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={std.assignedMentorName ? 'outline' : 'primary'}
                  onClick={() => setSelectedStudent(std)}
                  className="text-xs gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {std.assignedMentorName ? 'Reassign Mentor' : 'Assign Mentor'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mentor Assignment Modal */}
      {selectedStudent && (
        <MentorAssignModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onAssigned={handleMentorAssigned}
        />
      )}
    </div>
  );
}
