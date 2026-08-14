'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { FlaggedStudent } from './InterventionTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

interface MentorAssignModalProps {
  student: FlaggedStudent;
  onClose: () => void;
  onPaired: () => void;
}

interface MentorOption {
  id: string;
  name: string;
  dept: string;
  level: string;
  cgpa: number;
  email: string;
}

export function MentorAssignModal({ student, onClose, onPaired }: MentorAssignModalProps) {
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, department, current_level, cgpa, email')
        .in('role', ['GENERAL_STUDENT', 'STUDENT_EXECUTIVE'])
        .gte('cgpa', 4.0);
      const mapped = (data ?? [])
        .filter((p) => p.id !== student.id)
        .map((p) => ({
          id: p.id,
          name: p.full_name ?? 'Unnamed',
          dept: p.department ?? '—',
          level: p.current_level ? `${p.current_level}` : '—',
          cgpa: p.cgpa ?? 0,
          email: p.email ?? '',
        }));
      setMentors(mapped);
      if (mapped.length > 0) setSelectedMentorId(mapped[0].id);
      setLoadingMentors(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async () => {
    const mentor = mentors.find((m) => m.id === selectedMentorId);
    if (!mentor) return;

    setSaving(true);
    setError('');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be signed in.');
      setSaving(false);
      return;
    }

    // Real, persisted pairing — same mentor_pairings table used by Peer Mentorship.
    const { error: pairError } = await supabase
      .from('mentor_pairings')
      .upsert({ student_id: student.id, mentor_id: mentor.id, paired_by: user.id });

    if (pairError) {
      setError(pairError.message);
      setSaving(false);
      return;
    }

    fetch('/api/mentor/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorEmail: mentor.email, mentorName: mentor.name, studentName: student.fullName }),
    }).catch((err) => console.error('Mentor notification failed (non-blocking):', err));

    setSuccess(true);
    setSaving(false);
    setTimeout(onPaired, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="text-base font-extrabold text-[#1F2937]">Assign academic mentor</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#6B7280] font-medium">At-risk brethren</div>
          <div className="text-sm font-extrabold text-[#1F2937]">{student.fullName}</div>
          <div className="text-xs text-[#4B5563]">
            {student.department} ({student.level}L) · CGPA {student.cgpa.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1F2937]">Senior mentor (CGPA 4.00+)</label>
          {loadingMentors ? (
            <p className="text-xs text-[#6B7280]">Loading eligible mentors...</p>
          ) : mentors.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No one currently meets the CGPA 4.00+ mentor bar.</p>
          ) : (
            <Select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="text-xs font-semibold"
            >
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.dept} ({m.level}L) · CGPA {m.cgpa.toFixed(2)}
                </option>
              ))}
            </Select>
          )}
        </div>

        {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            Pairing saved. Mentor notified by email.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={saving || loadingMentors || mentors.length === 0}
          >
            {saving ? 'Saving…' : 'Confirm assignment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
