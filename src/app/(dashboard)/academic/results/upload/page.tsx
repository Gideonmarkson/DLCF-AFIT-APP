'use client';

import React, { useEffect, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Calculator, Upload, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface ResultRow {
  id: string;
  academic_session: string;
  semester: number;
  level: number;
  gpa: number;
  result_slip_url: string | null;
  is_verified: boolean;
}

export default function ResultsUploadPage() {
  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('1');
  const [level, setLevel] = useState('300');
  const [gpa, setGpa] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadResults = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('student_results').select('*').eq('student_id', user.id).order('academic_session', { ascending: false });
    setResults(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadResults(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!gpa) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let slipUrl: string | undefined;
    if (slipFile) {
      const ext = slipFile.name.split('.').pop();
      const path = `${user.id}/${session.replace('/', '-')}-sem${semester}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('result-slips').upload(path, slipFile, { upsert: true });
      if (uploadError) { setError(uploadError.message); return; }
      const { data: publicUrlData } = supabase.storage.from('result-slips').getPublicUrl(path);
      slipUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    }

    const { error: upsertError } = await supabase.from('student_results').upsert(
      {
        student_id: user.id,
        academic_session: session,
        semester: Number(semester),
        level: Number(level),
        gpa: Number(gpa),
        ...(slipUrl ? { result_slip_url: slipUrl } : {}),
      },
      { onConflict: 'student_id,academic_session,semester' }
    );

    if (upsertError) { setError(upsertError.message); return; }

    setSuccess(true);
    setGpa('');
    setSlipFile(null);
    loadResults();
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#1D4ED8]" /> Confidential Semester Result Slip Upload &amp; GPA Record
        </h1>
        <p className="text-xs text-[#6B7280] font-medium">
          Log your semester GPA and upload your official AFIT result slip — visible only to you, Associate Coordinators, and the Academic Secretary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-6 border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Session</label>
                <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="2025/2026" className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Semester</label>
                <Select value={semester} onChange={(e) => setSemester(e.target.value)} className="text-xs">
                  <option value="1">First</option>
                  <option value="2">Second</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Level</label>
                <Select value={level} onChange={(e) => setLevel(e.target.value)} className="text-xs">
                  {[100, 200, 300, 400, 500].map((l) => <option key={l} value={l}>{l}L</option>)}
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">This Semester&apos;s GPA</label>
              <Input type="number" step="0.01" min="0" max="5" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 4.35" className="text-xs font-bold" required />
            </div>

            <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center bg-[#F8FAFC]">
              <input type="file" accept="image/*,.pdf" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="w-5 h-5 text-[#1D4ED8]" />
                <span className="text-xs font-bold text-[#1F2937]">{slipFile ? slipFile.name : 'Upload official result slip (optional)'}</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semester result logged successfully..
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full text-xs font-bold rounded-xl py-2.5">Save Result</Button>
          </form>
        </Card>

        <Card className="lg:col-span-6 border-[#E2E8F0] bg-white p-6 space-y-3 shadow-xs">
          <h2 className="text-sm font-extrabold text-[#1F2937]">Your Logged Results</h2>
          {loading ? (
            <p className="text-xs text-[#6B7280]">Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No results logged yet.</p>
          ) : (
            results.map((r) => (
              <div key={r.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-[#1F2937]">{r.academic_session} · Semester {r.semester} · {r.level}L</div>
                  {r.result_slip_url && <a href={r.result_slip_url} target="_blank" rel="noopener noreferrer" className="text-[#1D4ED8] font-semibold">View uploaded slip</a>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-[#1D4ED8]">{Number(r.gpa).toFixed(2)}</span>
                  <Badge variant={r.is_verified ? 'emerald' : 'slate'} className="text-[10px]">{r.is_verified ? 'Verified' : 'Unverified'}</Badge>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
