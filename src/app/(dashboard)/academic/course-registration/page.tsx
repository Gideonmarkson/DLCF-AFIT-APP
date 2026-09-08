'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { GraduationCap, Plus, Trash2, Upload, FileCheck, CheckCircle2, Calculator, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
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
  const [currentLevel, setCurrentLevel] = useState('');
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnits, setNewUnits] = useState(3);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      setError(`Could not confirm your login session: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (!user) {
      setError('Your session has expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const semesterNum = semester === 'First Semester' ? 1 : 2;

    const [profileResult, registrationsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('course_slip_url, current_level')
        .eq('id', user.id)
        .single(),
      supabase
        .from('student_registered_courses')
        .select('id, academic_session, semester, course_id, courses(course_code, course_title, credit_units)')
        .eq('student_id', user.id)
        .eq('academic_session', session)
        .eq('semester', semesterNum)
        .order('created_at', { ascending: true }),
    ]);

    if (profileResult.error) {
      setError(`Could not load your academic profile: ${profileResult.error.message}`);
    } else {
      setSlipUrl(profileResult.data?.course_slip_url ?? null);
      setCurrentLevel(profileResult.data?.current_level ? String(profileResult.data.current_level) : '');
    }

    if (registrationsResult.error) {
      setCourses([]);
      setError((previous) => previous || `Could not load your registered courses: ${registrationsResult.error.message}`);
    } else {
      setCourses(
        (registrationsResult.data ?? []).map((row: any) => ({
          registrationId: row.id,
          courseId: row.course_id,
          code: row.courses?.course_code ?? '—',
          title: row.courses?.course_title ?? '—',
          units: Number(row.courses?.credit_units ?? 0),
        }))
      );
    }

    setLoading(false);
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
            <h2 className="text-xl font-extrabold text-[#1F2937]">Course Registration is Reserved for AFIT Students</h2>
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

  const totalUnits = courses.reduce((sum, course) => sum + Number(course.units), 0);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = newCode.trim().toUpperCase();
    if (!code) {
      setError('Enter a valid course code.');
      return;
    }

    setAddingCourse(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message || 'Your session has expired. Please sign in again.');
      }

      // Courses are catalog records maintained by the Academic Director.
      // Students should register an existing course, not create catalog records.
      const { data: existingCourse, error: courseLookupError } = await supabase
        .from('courses')
        .select('id, course_code, course_title, credit_units, level, department')
        .eq('course_code', code)
        .maybeSingle();

      if (courseLookupError) throw courseLookupError;
      if (!existingCourse) {
        throw new Error(`Course ${code} is not in the AFIT course catalogue. Ask the Academic Director to add it before registering.`);
      }

      if (currentLevel && String(existingCourse.level) !== currentLevel) {
        throw new Error(`Course ${code} is catalogued for ${existingCourse.level}L, while your profile is ${currentLevel}L.`);
      }

      const semesterNum = semester === 'First Semester' ? 1 : 2;
      const alreadyListed = courses.some((course) => course.courseId === existingCourse.id);
      if (alreadyListed) {
        throw new Error(`${code} is already in this semester's course list.`);
      }

      // Keep the course in local pending state. The final save operation commits
      // all registration rows together instead of partially registering courses.
      setCourses((previous) => [
        ...previous,
        {
          registrationId: `pending-${existingCourse.id}-${semesterNum}`,
          courseId: existingCourse.id,
          code: existingCourse.course_code,
          title: existingCourse.course_title,
          units: Number(existingCourse.credit_units),
        },
      ]);
      setNewCode('');
      setNewTitle('');
      setNewUnits(3);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not add this course.'));
    } finally {
      setAddingCourse(false);
    }
  };

  const handleRemoveCourse = async (course: RegisteredCourse) => {
    setError('');
    setRemovingCourseId(course.registrationId);

    try {
      // Pending courses only exist in local state.
      if (course.registrationId.startsWith('pending-')) {
        setCourses((previous) => previous.filter((item) => item.registrationId !== course.registrationId));
        return;
      }

      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('student_registered_courses')
        .delete()
        .eq('id', course.registrationId);

      if (deleteError) throw deleteError;
      setCourses((previous) => previous.filter((item) => item.registrationId !== course.registrationId));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not remove the course.'));
    } finally {
      setRemovingCourseId(null);
    }
  };

  const handleSlipSelection = (file: File | null) => {
    setError('');
    if (!file) {
      setSlipFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSlipFile(null);
      setError('The course registration slip is larger than 10MB. Please choose a smaller file.');
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
    setSaving(true);
    setIsSavedSuccess(false);

    let uploadedPath: string | null = null;
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message || 'Your session has expired. Please sign in again.');
      }

      if (courses.length === 0) {
        throw new Error('Add at least one course before completing registration.');
      }

      const semesterNum = semester === 'First Semester' ? 1 : 2;

      if (slipFile) {
        const ext = slipFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        uploadedPath = `${user.id}/course-slip.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('course-slips')
          .upload(uploadedPath, slipFile, {
            upsert: true,
            cacheControl: '3600',
            contentType: slipFile.type,
          });

        if (uploadError) {
          throw new Error(
            `Course slip upload failed: ${uploadError.message}. Confirm the course-slips storage bucket/policies migration has been applied in Supabase.`
          );
        }

        const { data: publicUrlData } = supabase.storage.from('course-slips').getPublicUrl(uploadedPath);
        if (!publicUrlData?.publicUrl) throw new Error('The course slip uploaded, but its public URL could not be created.');

        const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ course_slip_url: freshUrl })
          .eq('id', user.id);

        if (profileUpdateError) throw profileUpdateError;
        setSlipUrl(freshUrl);
      }

      const rowsToPersist = courses.map((course) => ({
        student_id: user.id,
        course_id: course.courseId,
        academic_session: session,
        semester: semesterNum,
      }));

      const { error: registrationError } = await supabase
        .from('student_registered_courses')
        .upsert(rowsToPersist, {
          onConflict: 'student_id,course_id,academic_session,semester',
          ignoreDuplicates: true,
        });

      if (registrationError) throw registrationError;

      await loadData();
      setIsSavedSuccess(true);
      window.setTimeout(() => setIsSavedSuccess(false), 2500);
    } catch (caughtError) {
      // Do not leave an uploaded slip orphaned if the DB write fails.
      if (uploadedPath) {
        await supabase.storage.from('course-slips').remove([uploadedPath]).catch(() => undefined);
      }
      setError(getErrorMessage(caughtError, 'Could not complete course registration.'));
    } finally {
      setSaving(false);
    }
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
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">Register your courses, calculate total credit units, and upload official AFIT course slip proof.</p>
            </div>
          </div>
          <Link href="/academic/peer-network">
            <Button variant="primary" size="sm" className="gap-1.5 rounded-xl font-bold">View Peer Mentorship Network <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2"><Calculator className="w-5 h-5 text-[#1D4ED8]" /> Session &amp; Semester Course Setup</h2>
              <p className="text-xs text-[#6B7280]">Use the academic session for which you are registering. Courses are taken from the official AFIT catalogue.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Academic Session</label>
                <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="e.g. 2025/2026" className="text-xs font-bold" />
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
              <div className="text-xs font-extrabold text-[#1D4ED8]">Add Enrolled Course Entry</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4">
                  <Input placeholder="e.g. EEE 309" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="text-xs font-mono font-bold uppercase" required />
                </div>
                <div className="sm:col-span-5">
                  <Input placeholder="Title (for reference)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="text-xs" />
                </div>
                <div className="sm:col-span-3">
                  <Input type="number" min="1" max="6" placeholder="Units" value={newUnits} onChange={(e) => setNewUnits(Number(e.target.value))} className="text-xs font-mono font-bold" disabled />
                </div>
              </div>
              <p className="text-[10px] text-[#6B7280]">The title and units shown here are read from the official catalogue after the course code is found.</p>
              <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold gap-1 border-[#1D4ED8] text-[#1D4ED8]" disabled={addingCourse || loading}>
                <Plus className="w-4 h-4" /> {addingCourse ? 'Checking catalogue…' : 'Add Course to List'}
              </Button>
            </form>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#1F2937]">Official AFIT Course Registration Slip (PDF / Image)</label>
              {slipUrl && !slipFile && (
                <a href={slipUrl} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  A slip is already on file — click to view. Upload a new one below to replace it.
                </a>
              )}
              <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center hover:border-[#1D4ED8] transition-colors bg-[#F8FAFC]">
                <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => handleSlipSelection(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-1.5"><Upload className="w-6 h-6 text-[#1D4ED8]" /><span className="text-xs font-bold text-[#1F2937]">{slipFile ? slipFile.name : 'Click or drop official AFIT Course Slip'}</span><span className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG (Max 10MB)</span></div>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold" role="alert">{error}</p>}
            {isSavedSuccess && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved successfully.</div>}
            <Button onClick={handleSaveRegistration} variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5" disabled={saving || loading}>
              <FileCheck className="w-4 h-4" /> {saving ? 'Saving registration…' : 'Complete & Save Course Registration'}
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div><h2 className="text-sm font-extrabold text-[#1F2937]">Enrolled Session Courses ({courses.length})</h2><p className="text-[11px] text-[#6B7280]">Registered for {semester} {session}</p></div>
              <Badge variant="blue" className="text-xs font-mono">Total: {totalUnits} Units</Badge>
            </div>
            <div className="space-y-2.5">
              {loading ? <p className="text-xs text-[#6B7280]">Loading your academic record…</p> : courses.length === 0 ? <p className="text-xs text-[#6B7280]">No courses registered for this session/semester yet.</p> : courses.map((course) => (
                <div key={course.registrationId} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div className="space-y-0.5"><div className="font-extrabold text-[#1F2937] flex items-center gap-2"><span className="font-mono text-[#1D4ED8]">{course.code}</span><span>•</span><span>{course.title}</span></div><div className="text-[10px] text-[#6B7280] font-mono">{course.units} Credit Units{course.registrationId.startsWith('pending-') ? ' · Pending save' : ''}</div></div>
                  <button type="button" aria-label={`Remove ${course.code}`} onClick={() => void handleRemoveCourse(course)} disabled={removingCourseId === course.registrationId} className="p-1 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
