'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  level: string | number;
  gpa: number;
  result_slip_url: string | null;
  is_verified: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export default function ResultsUploadPage() {
  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('1');
  const [level, setLevel] = useState('');
  const [gpa, setGpa] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError(authError?.message || 'Your session has expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const [profileResult, resultsResult] = await Promise.all([
      supabase.from('profiles').select('current_level').eq('id', user.id).single(),
      supabase.from('student_results').select('*').eq('student_id', user.id).order('academic_session', { ascending: false }).order('semester', { ascending: false }),
    ]);

    if (profileResult.error) {
      setError(`Could not load your academic level: ${profileResult.error.message}`);
    } else if (profileResult.data?.current_level) {
      setLevel(String(profileResult.data.current_level));
    }

    if (resultsResult.error) {
      setResults([]);
      setError((previous) => previous || `Could not load your saved results: ${resultsResult.error.message}`);
    } else {
      setResults((resultsResult.data ?? []) as ResultRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const handleSlipSelection = (file: File | null) => {
    setError('');
    if (!file) {
      setSlipFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSlipFile(null);
      setError('The result slip is larger than 10MB. Please choose a smaller file.');
      return;
    }
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setSlipFile(null);
      setError('Unsupported file type. Upload a PDF, PNG, or JPG file.');
      return;
    }
    setSlipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numericGpa = Number(gpa);
    const numericLevel = Number(level);
    if (!level) {
      setError('Your academic level could not be loaded. Refresh the page or update your profile first.');
      return;
    }
    if (!Number.isFinite(numericGpa) || numericGpa < 0 || numericGpa > 5) {
      setError('Enter a GPA between 0.00 and 5.00.');
      return;
    }

    setSaving(true);
    let uploadedPath: string | null = null;
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error(authError?.message || 'Your session has expired. Please sign in again.');

      let slipUrl: string | undefined;
      if (slipFile) {
        const ext = slipFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        uploadedPath = `${user.id}/${session.replaceAll('/', '-')}-sem${semester}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('result-slips').upload(uploadedPath, slipFile, {
          upsert: true,
          cacheControl: '3600',
          contentType: slipFile.type,
        });
        if (uploadError) {
          throw new Error(`Result slip upload failed: ${uploadError.message}. Confirm the result-slips storage bucket/policies migration has been applied in Supabase.`);
        }

        const { data: publicUrlData } = supabase.storage.from('result-slips').getPublicUrl(uploadedPath);
        if (!publicUrlData?.publicUrl) throw new Error('The result slip uploaded, but its public URL could not be created.');
        slipUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const payload = {
        student_id: user.id,
        academic_session: session.trim(),
        semester: Number(semester),
        level: String(level),
        gpa: Number(numericGpa.toFixed(2)),
        ...(slipUrl ? { result_slip_url: slipUrl } : {}),
      };

      const { error: upsertError } = await supabase
        .from('student_results')
        .upsert(payload, { onConflict: 'student_id,academic_session,semester' });

      if (upsertError) throw upsertError;

      await loadResults();
      setGpa('');
      setSlipFile(null);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (caughtError) {
      if (uploadedPath) {
        await supabase.storage.from('result-slips').remove([uploadedPath]).catch(() => undefined);
      }
      setError(getErrorMessage(caughtError, 'Could not save the semester result.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2"><Calculator className="w-5 h-5 text-[#1D4ED8]" /> Confidential Semester Result Slip Upload &amp; GPA Record</h1>
        <p className="text-xs text-[#6B7280] font-medium">Log your semester GPA and upload your official AFIT result slip — visible only to you, Associate Coordinators, and the Academic Secretary.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-6 border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Session</label>
                <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="2025/2026" className="text-xs" required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Semester</label>
                <Select value={semester} onChange={(e) => setSemester(e.target.value)} className="text-xs"><option value="1">First</option><option value="2">Second</option></Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Level</label>
                <Select value={level} onChange={(e) => setLevel(e.target.value)} className="text-xs" disabled={loading} required>
                  {[100, 200, 300, 400, 500].map((item) => <option key={item} value={item}>{item}L</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">This Semester&apos;s GPA</label>
              <Input type="number" step="0.01" min="0" max="5" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 4.35" className="text-xs font-bold" required />
            </div>
            <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center bg-[#F8FAFC]">
              <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => handleSlipSelection(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-1.5"><Upload className="w-5 h-5 text-[#1D4ED8]" /><span className="text-xs font-bold text-[#1F2937]">{slipFile ? slipFile.name : 'Upload official result slip (optional)'}</span><span className="text-[10px] text-[#6B7280]">PDF, PNG or JPG — Max 10MB</span></div>
            </div>
            {error && <p className="text-xs text-red-600 font-bold" role="alert">{error}</p>}
            {success && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semester result logged successfully.</div>}
            <Button type="submit" variant="primary" className="w-full text-xs font-bold rounded-xl py-2.5" disabled={saving || loading}>{saving ? 'Saving result…' : 'Save Result'}</Button>
          </form>
        </Card>
        <Card className="lg:col-span-6 border-[#E2E8F0] bg-white p-6 space-y-3 shadow-xs">
          <h2 className="text-sm font-extrabold text-[#1F2937]">Your Logged Results</h2>
          {loading ? <p className="text-xs text-[#6B7280]">Loading your results…</p> : results.length === 0 ? <p className="text-xs text-[#6B7280]">No results logged yet.</p> : results.map((result) => (
            <div key={result.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div><div className="font-extrabold text-[#1F2937]">{result.academic_session} · Semester {result.semester} · {result.level}L</div>{result.result_slip_url && <a href={result.result_slip_url} target="_blank" rel="noopener noreferrer" className="text-[#1D4ED8] font-semibold">View uploaded slip</a>}</div>
              <div className="flex items-center gap-2"><span className="font-mono font-extrabold text-[#1D4ED8]">{Number(result.gpa).toFixed(2)}</span><Badge variant={result.is_verified ? 'emerald' : 'slate'} className="text-[10px]">{result.is_verified ? 'Verified' : 'Unverified'}</Badge></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
