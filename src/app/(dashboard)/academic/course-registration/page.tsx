'use client';

import React, { useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { GraduationCap, Plus, Trash2, Upload, FileCheck, CheckCircle2, Calculator, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';

interface CourseEntry {
  code: string;
  title: string;
  units: number;
}

const INITIAL_COURSES: CourseEntry[] = [
  { code: 'AEE 311', title: 'Aerodynamics I', units: 3 },
  { code: 'MET 301', title: 'Fluid Mechanics II', units: 3 },
  { code: 'EEE 301', title: 'Applied Electronics', units: 2 },
  { code: 'GNS 311', title: 'Engineers in Society', units: 2 },
  { code: 'MAT 301', title: 'Advanced Engineering Math', units: 3 },
];

export default function CourseRegistrationPage() {
  const { userRole } = useRole();
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('First Semester');
  const [courses, setCourses] = useState<CourseEntry[]>(INITIAL_COURSES);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnits, setNewUnits] = useState(3);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Access Control Guard for Associate Coordinators
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
              <Button variant="outline" className="rounded-xl text-xs font-bold">
                Return to Home Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalUnits = courses.reduce((sum, c) => sum + Number(c.units), 0);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;
    setCourses([...courses, { code: newCode.toUpperCase(), title: newTitle, units: Number(newUnits) }]);
    setNewCode('');
    setNewTitle('');
    setNewUnits(3);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleSaveRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Academic SubNav */}
      <AcademicSubNav />

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                  AFIT Session Course Registration Portal
                </h1>
                <Badge variant="blue">Session 2025/2026</Badge>
              </div>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Register your registered semester courses, calculate total credit units, and upload official AFIT course slip proof.
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
        
        {/* Left Column: Course Registration Form & Slips Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#1D4ED8]" /> Session &amp; Semester Course Setup
              </h2>
              <p className="text-xs text-[#6B7280]">
                Select your active academic session and semester to log your enrolled courses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Academic Session</label>
                <Select value={session} onChange={(e) => setSession(e.target.value)} className="text-xs font-bold">
                  <option value="2025/2026">2025 / 2026 Session</option>
                  <option value="2024/2025">2024 / 2025 Session</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Semester</label>
                <Select value={semester} onChange={(e) => setSemester(e.target.value)} className="text-xs font-bold">
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </Select>
              </div>
            </div>

            {/* Add New Course Form */}
            <form onSubmit={handleAddCourse} className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-extrabold text-[#1D4ED8]">Add Enrolled Course Entry</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4">
                  <Input
                    placeholder="e.g. AEE 311"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="text-xs font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div className="sm:col-span-5">
                  <Input
                    placeholder="e.g. Aerodynamics I"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="Units"
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>
              <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold gap-1 border-[#1D4ED8] text-[#1D4ED8]">
                <Plus className="w-4 h-4" /> Add Course to List
              </Button>
            </form>

            {/* Upload Course Slip Proof */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#1F2937]">
                Upload Official AFIT Course Registration Slip (PDF / Image Proof)
              </label>
              <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center hover:border-[#1D4ED8] transition-colors bg-[#F8FAFC]">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-6 h-6 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#1F2937]">
                    {slipFile ? slipFile.name : 'Click or drop official AFIT Course Slip PDF'}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG (Max 10MB)</span>
                </div>
              </div>
            </div>

            {isSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Semester course registration saved successfully! Peer network updated.
              </div>
            )}

            <Button onClick={handleSaveRegistration} variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5">
              <FileCheck className="w-4 h-4" /> Complete &amp; Save Course Registration
            </Button>
          </Card>
        </div>

        {/* Right Column: Registered Session Courses List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#1F2937]">Enrolled Session Courses ({courses.length})</h2>
                <p className="text-[11px] text-[#6B7280]">Registered for {semester} {session}</p>
              </div>
              <Badge variant="blue" className="text-xs font-mono">
                Total: {totalUnits} Units
              </Badge>
            </div>

            <div className="space-y-2.5">
              {courses.map((course, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-[#1F2937] flex items-center gap-2">
                      <span className="font-mono text-[#1D4ED8]">{course.code}</span>
                      <span>•</span>
                      <span>{course.title}</span>
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-mono">{course.units} Credit Units</div>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs text-[#1D4ED8] font-semibold space-y-1">
              <div className="font-extrabold">Matching Status:</div>
              <p className="text-[11px] text-[#4B5563]">
                Your enrolled courses are automatically paired with Senior Mentors and Classmates in the Peer Mentorship Network.
              </p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
