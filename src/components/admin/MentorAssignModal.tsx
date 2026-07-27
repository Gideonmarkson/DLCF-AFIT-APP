'use client';

import React, { useState } from 'react';
import { Award, UserCheck, X, CheckCircle2 } from 'lucide-react';
import { FlaggedStudent } from './InterventionTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MentorAssignModalProps {
  student: FlaggedStudent;
  onClose: () => void;
  onAssigned: (mentorName: string) => void;
}

const HIGH_ACHIEVING_SENIORS = [
  { id: 'm-1', name: 'Brother Daniel Adebayo', dept: 'Aeronautical Engineering', level: 500, cgpa: 4.82 },
  { id: 'm-2', name: 'Sister Faith Ogundele', dept: 'Mechanical Engineering', level: 400, cgpa: 4.65 },
  { id: 'm-3', name: 'Brother Samuel Okoh', dept: 'Electrical Engineering', level: 500, cgpa: 4.75 },
];

export function MentorAssignModal({ student, onClose, onAssigned }: MentorAssignModalProps) {
  const [selectedMentorId, setSelectedMentorId] = useState(HIGH_ACHIEVING_SENIORS[0].id);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = () => {
    const mentor = HIGH_ACHIEVING_SENIORS.find((m) => m.id === selectedMentorId);
    if (mentor) {
      setIsSuccess(true);
      setTimeout(() => {
        onAssigned(mentor.name + ` (${mentor.level}L)`);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FF3D4A]" />
            <h3 className="text-base font-extrabold text-[#1F2937]">Assign Academic Mentor</h3>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E5E7EB] space-y-1">
          <div className="text-xs text-[#6B7280] font-medium">At-Risk Brethren Details</div>
          <div className="text-sm font-extrabold text-[#1F2937]">{student.fullName}</div>
          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
            <span>{student.department} ({student.level}L)</span>
            <Badge variant="rose">CGPA: {student.cgpa.toFixed(2)}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1F2937]">
            Select Verified High-Achieving Senior Mentor (CGPA &gt;= 4.00)
          </label>
          <Select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="text-xs font-semibold"
          >
            {HIGH_ACHIEVING_SENIORS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.dept} ({m.level}L) | CGPA: {m.cgpa.toFixed(2)}
              </option>
            ))}
          </Select>
        </div>

        {isSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            Academic mentorship assignment dispatched! Notification sent to mentor and student.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} className="gap-1.5">
            <UserCheck className="w-4 h-4" /> Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
