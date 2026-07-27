'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Trash2, Calculator, Upload, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GradeLetter } from '@/types/database.types';
import { ResultRowInput } from '@/types/academic';
import { calculateGPA, calculateCumulativeCGPA } from '@/lib/gpa-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DynamicResultTableProps {
  initialCgpa?: number;
  initialUnits?: number;
  onSuccess?: (gpa: number, cgpa: number) => void;
}

const DEFAULT_ROWS: ResultRowInput[] = [
  { id: '1', courseCode: 'AEE 311', courseTitle: 'Aerodynamics I', creditUnits: 3, grade: 'A' },
  { id: '2', courseCode: 'MET 301', courseTitle: 'Fluid Mechanics II', creditUnits: 3, grade: 'B' },
  { id: '3', courseCode: 'EEE 301', courseTitle: 'Electric Circuit Theory II', creditUnits: 3, grade: 'A' },
  { id: '4', courseCode: 'GNS 301', courseTitle: 'Business Ethics & Leadership', creditUnits: 2, grade: 'B' },
];

export function DynamicResultTable({ initialCgpa = 4.10, initialUnits = 45, onSuccess }: DynamicResultTableProps) {
  const [session, setSession] = useState('2024/2025');
  const [level, setLevel] = useState<number>(300);
  const [semester, setSemester] = useState<number>(1);
  const [rows, setRows] = useState<ResultRowInput[]>(DEFAULT_ROWS);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentGPA = calculateGPA(rows.map(r => ({ creditUnits: r.creditUnits, grade: r.grade })));
  const currentUnits = rows.reduce((sum, r) => sum + (Number(r.creditUnits) || 0), 0);
  const { cgpa: newCGPA, isUnderperforming } = calculateCumulativeCGPA(initialCgpa, initialUnits, currentGPA, currentUnits);

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setRows([
      ...rows,
      { id: newId, courseCode: '', courseTitle: '', creditUnits: 3, grade: 'A' },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof ResultRowInput, value: any) => {
    setRows(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await new Promise((res) => setTimeout(res, 800));
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(currentGPA, newCGPA);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Session / Semester Selection Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Academic Session</label>
          <Select value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="2024/2025">2024 / 2025</option>
            <option value="2023/2024">2023 / 2024</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Level</label>
          <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            <option value={100}>100 Level</option>
            <option value={200}>200 Level</option>
            <option value={300}>300 Level</option>
            <option value={400}>400 Level</option>
            <option value={500}>500 Level</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1F2937] mb-1.5">Semester</label>
          <Select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
            <option value={1}>First Semester</option>
            <option value={2}>Second Semester</option>
          </Select>
        </div>
      </div>

      {/* Dynamic Course Rows Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#FF3D4A]" />
            Course Grades Entry
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
            <Plus className="w-3.5 h-3.5" /> Add Course Row
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead className="w-28">Units</TableHead>
              <TableHead className="w-28">Grade</TableHead>
              <TableHead className="w-12 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    placeholder="e.g. AEE 311"
                    value={row.courseCode}
                    onChange={(e) => handleRowChange(row.id, 'courseCode', e.target.value.toUpperCase())}
                    className="font-mono text-xs uppercase font-bold"
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Course Description"
                    value={row.courseTitle}
                    onChange={(e) => handleRowChange(row.id, 'courseTitle', e.target.value)}
                    className="text-xs"
                    required
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.creditUnits}
                    onChange={(e) => handleRowChange(row.id, 'creditUnits', Number(e.target.value))}
                    className="text-xs"
                  >
                    <option value={1}>1 Unit</option>
                    <option value={2}>2 Units</option>
                    <option value={3}>3 Units</option>
                    <option value={4}>4 Units</option>
                    <option value={6}>6 Units</option>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.grade}
                    onChange={(e) => handleRowChange(row.id, 'grade', e.target.value as GradeLetter)}
                    className="text-xs font-bold text-[#FF3D4A]"
                  >
                    <option value="A">A (5 Pts)</option>
                    <option value="B">B (4 Pts)</option>
                    <option value="C">C (3 Pts)</option>
                    <option value="D">D (2 Pts)</option>
                    <option value="E">E (1 Pt)</option>
                    <option value="F">F (0 Pts)</option>
                  </Select>
                </TableCell>
                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-[#9CA3AF] hover:text-rose-600 p-1.5 transition-colors disabled:opacity-30"
                    disabled={rows.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Proof Dropzone */}
      <div className="p-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-white text-center space-y-2 shadow-sm">
        <Upload className="w-6 h-6 text-[#FF3D4A] mx-auto" />
        <div className="text-xs text-[#1F2937] font-bold">
          Optional Result Slip Proof Upload (PDF / Image)
        </div>
        <p className="text-[11px] text-[#6B7280]">
          Encrypted directly to private storage. Accessible ONLY by Associate Coordinators.
        </p>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs text-[#6B7280] file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFF0F1] file:text-[#FF3D4A] hover:file:bg-[#FF3D4A] hover:file:text-white cursor-pointer"
        />
        {file && <div className="text-xs text-emerald-600 font-mono font-bold pt-1">Selected: {file.name}</div>}
      </div>

      {/* Live GPA / CGPA Calculated Summary Box */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B7280] font-semibold">Calculated Semester GPA</div>
            <div className="text-2xl font-extrabold font-mono text-[#FF3D4A]">{currentGPA.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] font-semibold">Estimated New Cumulative CGPA</div>
            <div className="text-2xl font-extrabold font-mono text-[#D97706]">{newCGPA.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] font-semibold">Total Semester Units</div>
            <div className="text-lg font-bold text-[#1F2937]">{currentUnits} Credit Units</div>
          </div>
        </div>

        {isUnderperforming && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#92400E] text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <strong className="block font-bold">Academic Intervention Trigger</strong>
              Calculated CGPA is below 2.50. This record will automatically alert Associate Coordinators to pair you with a dedicated senior academic mentor.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#FF3D4A]" />
            Row-Level Security Protected: Strictly confidential
          </div>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? 'Calculating & Saving...' : 'Submit Confidential Result'}
          </Button>
        </div>
      </div>

      {isSubmitted && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          Result logged successfully! GPA: {currentGPA.toFixed(2)} | Updated CGPA: {newCGPA.toFixed(2)}.
        </div>
      )}
    </form>
  );
}
