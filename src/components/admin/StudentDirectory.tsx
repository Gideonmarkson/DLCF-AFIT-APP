'use client';

import React, { useEffect, useState } from 'react';
import { Search, Phone, Mail, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  cgpa: number | null;
  department: string | null;
  current_level: string | null;
}

function cgpaColor(cgpa: number | null) {
  if (cgpa === null) return 'text-[#6B7280] bg-[#F1F5F9]';
  if (cgpa < 2.5) return 'text-rose-700 bg-rose-50';
  if (cgpa < 3.5) return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
}

function waHref(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

export function StudentDirectory() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, cgpa, department, current_level')
        .in('role', ['GENERAL_STUDENT', 'STUDENT_EXECUTIVE'])
        .order('cgpa', { ascending: true, nullsFirst: false });
      setStudents(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = students.filter((s) =>
    (s.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
          Student Directory ({students.length})
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-[#6B7280]">Loading students...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-[#6B7280]">No students found.</p>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {filtered.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#1F2937] truncate">{s.full_name ?? 'Unnamed'}</div>
                <div className="text-[11px] text-[#6B7280] truncate">
                  {s.department ?? 'No department set'}{s.current_level ? ` · ${s.current_level}L` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-mono font-extrabold px-2 py-1 rounded-lg ${cgpaColor(s.cgpa)}`}>
                  {s.cgpa !== null ? s.cgpa.toFixed(2) : '—'}
                </span>
                {s.phone_number && (
                  <a href={`tel:${s.phone_number}`} className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]" title="Call">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                {waHref(s.phone_number) && (
                  <a href={waHref(s.phone_number)!} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="WhatsApp">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`} className="p-1.5 rounded-lg bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E2E8F0]" title="Email">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
