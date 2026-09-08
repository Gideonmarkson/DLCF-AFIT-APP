'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HeartHandshake,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface RegisteredCourse {
  registrationId: string;
  courseId: string;
  code: string;
  title: string;
  units: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export default function CourseRegistrationPage() {
  const { userRole } = useRole();
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('First Semester');
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const slipInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Your session has expired. Please sign in again.');
      }

      const semesterNum = semester === 'First Semester' ? 1 : 2;
      const [profileResult, regsResult] = await Promise.all([
        supabase.from('profiles').select('course_slip_url').eq('id', user.id).single(),
        supabase
          .from('student_registered_courses')
          .select('id, academic_session, semester, course_id, credit_units, courses(course_code, course_title, credit_units)')
          .eq('student_id', user.id)
          .eq('academic_session', session.trim())
          .eq('semester', semesterNum),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (regsResult.error) throw regsResult.error;

      setSlipUrl(profileResult.data?.course_slip_url ?? null);
      setCourses(
        (regsResult.data ?? []).map((r: any) => ({
          registrationId: r.id,
          courseId: r.course_id,
          code: r.courses?.course_code ?? '—',
          title: r.courses?.course_title ?? '—',
          units: Number(r.credit_units ?? r.courses?.credit_units ?? 0),
        }))
      );
    } catch (caughtError) {
      setCourses([]);
      setSlipUrl(null);
      setError(getErrorMessage(caughtError, 'Could not load your course registration data.'));
    } finally {
      setLoading(false);
    }
  }, [semester, session]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isStaff) {
    return (
      <div className="space-y-6 font-sans max-w-3xl mx-auto py-8">
        <Card className="border-[#E2E8F0] bg-white p-8 text-center space-y-5 shadow-md rounded-3xl">
          <div className="w-16 h-16 rounded-3xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8 stroke-[1.75px]" />
          </div>
          <div className="space-y-2">
            <Badge variant="blue" className="text-xs">Associate Coordinator Access Guard</Badge>
            <h2 className="text-xl font-extrabold text-[#1F2937]">
              Course Registration is Reserved for AFIT Students
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-md mx-auto">
              As an Associate Coordinator, your portal is designated for pastoral care, confidential member counseling replies, and fellowship advisory.
            </p>
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/spiritual/counseling">
              <Button variant="primary" className="gap-2 rounded-xl text-xs font-bold py-2.5">
                <HeartHandshake className="w-4 h-4" /> Go to Pastoral Counseling Reply Portal
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl text-xs font-bold">Return to Home Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = newCode.trim().toUpperCase();
    const title = newTitle.trim();
    const units = Number(newUnits);

    if (!code || !title) {
      setError('Enter both a course code and course title.');
      return;
    }
    if (!Number.isInteger(units) || units < 1 || units > 6) {
      setError('Enter a valid course unit value from 1 to 6.');
      return;
    }

    const supabase = createClient();
    setSaving(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error(authError?.message || 'Your session has expired. Please sign in again.');

      const { data: existingCourse, error: findError } = await supabase
        .from('courses')
        .select('id')
        .eq('course_code', code)
        .maybeSingle();
      if (findError) throw findError;

      let courseId = existingCourse?.id;
      if (!courseId) {
        const { data: profileRow, error: profileError } = await supabase
          .from('profiles')
          .select('department, current_level')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;

        const { data: createdCourse, error: createCourseError } = await supabase
          .from('courses')
          .insert({
            course_code: code,
            course_title: title,
            credit_units: units,
            level: profileRow.current_level,
            department: profileRow.department || 'General',
          })
          .select('id')
          .single();

        if (createCourseError) {
          if (createCourseError.code === '23505') {
            const { data: raceWinner, error: raceError } = await supabase
              .from('courses')
              .select('id')
              .eq('course_code', code)
              .maybeSingle();
            if (raceError || !raceWinner?.id) throw createCourseError;
            courseId = raceWinner.id;
          } else {
            throw createCourseError;
          }
        } else {
          courseId = createdCourse.id;
        }
      }

      if (courses.some((course) => course.code === code)) {
        throw new Error(`${code} is already in this semester's course list.`);
      }

      setCourses((previous) => [
        ...previous,
        {
          registrationId: `pending-${courseId}-${Date.now()}`,
          courseId,
          code,
          title,
          units,
        },
      ]);
      setNewCode('');
      setNewTitle('');
      setNewUnits('');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not add this course.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCourse = async (course: RegisteredCourse) => {
    const registrationId = course.registrationId;
    if (!window.confirm('Remove this course from your registration?')) return;

    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: deleteError } = await supabase
      .from('student_registered_courses')
      .delete()
      .eq('id', registrationId)
      .eq('student_id', user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadData();
  };

  const handleSlipSelection = (file: File | null) => {
    setError('');
    if (!file) {
      setSlipFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSlipFile(null);
      setError('The course slip is larger than 10MB. Please choose a smaller file.');
      return;
    }
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setSlipFile(null);
      setError('Unsupported file type. Upload a PDF, PNG, or JPG file.');
      return;
    }
    setSlipFile(file);
  };

  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSavedSuccess(false);

    if (!courses.length) {
      setError('Add at least one course before completing the registration.');
      return;
    }

    if (!slipFile && !slipUrl) {
      setError('Upload your official AFIT course registration slip before completing the registration.');
      return;
    }

    const supabase = createClient();
    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Your session has expired. Please sign in again.');
      }

      const pendingCourses = courses.filter((course) => course.registrationId.startsWith('pending-'));
      if (pendingCourses.length) {
        const rows = pendingCourses.map((course) => ({
          student_id: user.id,
          course_id: course.courseId,
          credit_units: course.units,
          academic_session: session.trim(),
          semester: semester === 'First Semester' ? 1 : 2,
        }));

        const { error: registrationError } = await supabase
          .from('student_registered_courses')
          .insert(rows);
        if (registrationError) {
          if (registrationError.code === '23505') {
            throw new Error('One or more courses are already registered for this session and semester. Refresh the page and review the list.');
          }
          throw registrationError;
        }
      }

      if (slipFile) {
        const ext = slipFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        const path = `${user.id}/slip.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('course-slips')
          .upload(path, slipFile, {
            upsert: true,
            cacheControl: '3600',
            contentType: slipFile.type,
          });
        if (uploadError) throw new Error(`Course slip upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('course-slips').getPublicUrl(path);
        if (!publicUrlData?.publicUrl) throw new Error('The course slip uploaded, but its public URL could not be created.');

        const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ course_slip_url: freshUrl })
          .eq('id', user.id);
        if (profileError) throw profileError;

        setSlipUrl(freshUrl);
        setSlipFile(null);
      }

      await loadData();
      setIsSavedSuccess(true);
      window.setTimeout(() => setIsSavedSuccess(false), 2500);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not save the course registration.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlip = async () => {
    if (!window.confirm('Delete the saved course registration slip?')) return;

    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ course_slip_url: null })
      .eq('id', user.id);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    const { data: storedFiles, error: listError } = await supabase.storage
      .from('course-slips')
      .list(user.id, { limit: 50 });

    if (!listError && storedFiles?.length) {
      const paths = storedFiles.map((file) => `${user.id}/${file.name}`);
      const { error: removeError } = await supabase.storage.from('course-slips').remove(paths);
      if (removeError) {
        setError(`The registration record was cleared, but the old file could not be removed: ${removeError.message}`);
      }
    }

    setSlipUrl(null);
    setSlipFile(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />

      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">AFIT Session Course Registration Portal</h1>
                <Badge variant="blue">{session}</Badge>
              </div>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Register any course you are taking, calculate your total units, and keep your official AFIT course slip on file.
              </p>
            </div>
          </div>
          <Link href="/academic/peer-network">
            <Button variant="primary" size="sm" className="gap-1.5 rounded-xl font-bold">
              View Peer Mentorship Network <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#1D4ED8]" /> Session &amp; Semester Course Setup
              </h2>
              <p className="text-xs text-[#6B7280]">Enter the session and semester, then add the courses you actually registered for.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Academic Session</label>
                <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="e.g. 2025/2026" className="text-xs font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Semester</label>
                <Select value={semester} onChange={(e) => setSemester(e.target.value)} className="text-xs font-bold">
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </Select>
              </div>
            </div>

            <form onSubmit={handleAddCourse} className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-extrabold text-[#1D4ED8]">Add Course</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wide">Course Code</label>
                  <Input placeholder="e.g. MCT 409" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="text-xs font-mono font-bold uppercase" required />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wide">Course Title</label>
                  <Input placeholder="e.g. Mechatronics Engineering Design" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="text-xs" required />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wide">Unit</label>
                  <Input type="number" min="1" max="6" step="1" inputMode="numeric" placeholder="e.g. 3" value={newUnits} onChange={(e) => setNewUnits(e.target.value)} className="text-xs font-bold" required />
                </div>
              </div>
              <p className="text-[10px] text-[#6B7280]">Enter the course code, course title, and credit unit exactly as they appear on your AFIT registration slip. There is no restricted course list.</p>
              <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold gap-1 border-[#1D4ED8] text-[#1D4ED8]" disabled={saving}>
                <Plus className="w-4 h-4" /> Add Course to List
              </Button>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-extrabold text-[#1F2937]">Official AFIT Course Registration Slip (PDF / Image)</label>
                {slipUrl && (
                  <button type="button" onClick={handleDeleteSlip} className="text-[10px] font-bold text-rose-600 hover:text-rose-700">
                    Delete saved slip
                  </button>
                )}
              </div>

              {slipUrl && !slipFile && (
                <a href={slipUrl} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  A course slip is already saved — click to view it. Select a new file below to replace it.
                </a>
              )}

              <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center hover:border-[#1D4ED8] transition-colors bg-[#F8FAFC]">
                <input ref={slipInputRef} type="file" accept="application/pdf,image/png,image/jpeg,.pdf" onChange={(e) => handleSlipSelection(e.target.files?.[0] || null)} className="absolute inset-0 z-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="relative z-10 flex flex-col items-center gap-1.5 pointer-events-none">
                  <Upload className="w-6 h-6 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#1F2937]">{slipFile ? slipFile.name : 'Click or drop official AFIT Course Slip'}</span>
                  <span className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG (Max 10MB)</span>
                </div>
                {slipFile && (
                  <button
                    type="button"
                    aria-label="Cancel selected course slip"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSlipFile(null);
                      if (slipInputRef.current) slipInputRef.current.value = '';
                    }}
                    className="absolute right-3 top-3 z-20 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#CBD5E1] text-slate-500 hover:text-rose-600 hover:border-rose-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold" role="alert">{error}</p>}
            {isSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Course registration saved successfully.
              </div>
            )}
            <Button onClick={handleSaveRegistration} variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5" disabled={saving || loading}>
              <FileCheck className="w-4 h-4" /> {saving ? 'Saving…' : 'Complete & Save Course Registration'}
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#1F2937]">Enrolled Session Courses ({courses.length})</h2>
                <p className="text-[11px] text-[#6B7280]">Registered for {semester} {session}</p>
              </div>
              <Badge variant="blue" className="text-xs font-mono">Total: {totalUnits} Units</Badge>
            </div>

            {loading ? (
              <p className="text-xs text-[#6B7280]">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[430px]">
                  <div className="grid grid-cols-[1.1fr_1.7fr_0.55fr_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide font-extrabold text-[#64748B] border-b border-[#E2E8F0]">
                    <span>Course Code</span>
                    <span>Course Title</span>
                    <span>Unit</span>
                    <span aria-hidden="true" />
                  </div>
                  {courses.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-[#6B7280]">No courses registered for this session and semester yet.</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.registrationId} className="grid grid-cols-[1.1fr_1.7fr_0.55fr_36px] gap-2 items-center p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mt-2 text-xs">
                        <span className="font-mono font-extrabold text-[#1D4ED8]">{course.code}</span>
                        <span className="font-semibold text-[#1F2937]">{course.title}</span>
                        <span className="font-mono font-bold text-[#1F2937]">{course.units}</span>
                        <button
                          type="button"
                          aria-label={`Delete ${course.code}`}
                          onClick={() => handleRemoveCourse(course)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
