'use client';

import React, { useState } from 'react';
import { Check, BookOpen, Sparkles, Users, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AFIT_DEPARTMENTS } from '@/lib/constants';

interface RegisteredCourse {
  id: string;
  code: string;
  title: string;
  units: number;
  semester: string;
}

const DEFAULT_COURSES: RegisteredCourse[] = [
  { id: '1', code: 'AEE 311', title: 'Aerodynamics I', units: 3, semester: '1st Semester' },
  { id: '2', code: 'MET 301', title: 'Fluid Mechanics II', units: 3, semester: '1st Semester' },
  { id: '3', code: 'EEE 301', title: 'Electric Circuit Theory II', units: 3, semester: '1st Semester' },
  { id: '4', code: 'AEE 312', title: 'Aircraft Structures I', units: 3, semester: '1st Semester' },
];

export function CourseRegistrationForm({ onRegistered }: { onRegistered?: (courses: RegisteredCourse[]) => void }) {
  const [courses, setCourses] = useState<RegisteredCourse[]>(DEFAULT_COURSES);
  const [session, setSession] = useState('2025/2026 Academic Session');
  const [semester, setSemester] = useState('1st Semester');
  const [department, setDepartment] = useState('B.Eng Aerospace Engineering');
  const [level, setLevel] = useState(300);

  // New Custom Course Inputs
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnits, setNewUnits] = useState(3);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    const item: RegisteredCourse = {
      id: Date.now().toString(),
      code: newCode.toUpperCase().trim(),
      title: newTitle.trim(),
      units: Number(newUnits),
      semester,
    };

    setCourses([...courses, item]);
    setNewCode('');
    setNewTitle('');
    setNewUnits(3);
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onRegistered) {
      onRegistered(courses);
    }
  };

  const totalUnits = courses.reduce((sum, c) => sum + c.units, 0);

  return (
    <Card className="border-[#E2E8F0] bg-white shadow-xs font-sans">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
            AFIT Session Course Registration & Slip Upload
          </CardTitle>
          <Badge variant="blue">{totalUnits} Credit Units Registered</Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Register your official courses for the session to trigger automated peer-matching with classmates and high-achieving senior mentors.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Session Metadata Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0]">
          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Academic Session</label>
            <Select value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="2025/2026 Academic Session">2025/2026 Academic Session</option>
              <option value="2026/2027 Academic Session">2026/2027 Academic Session</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Current Semester</label>
            <Select value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Department & Level</label>
            <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {AFIT_DEPARTMENTS.slice(0, 10).map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Course Registration List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
              Registered Courses List ({courses.length} Courses)
            </h3>
            <span className="text-xs font-mono font-bold text-[#1D4ED8]">{totalUnits} Total Units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-white flex items-center justify-between shadow-2xs hover:border-[#1D4ED8] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#1D4ED8]">{course.code}</span>
                    <Badge variant="slate" className="text-[10px]">{course.units} Units</Badge>
                  </div>
                  <div className="text-xs font-extrabold text-[#1F2937] mt-0.5">{course.title}</div>
                </div>

                <button
                  onClick={() => handleRemoveCourse(course.id)}
                  className="p-1.5 text-[#9CA3AF] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Course Form */}
        <form onSubmit={handleAddCourse} className="p-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] space-y-3">
          <div className="text-xs font-extrabold text-[#1F2937] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#1D4ED8]" /> Add Course to Registration Form
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <Input
                placeholder="Course Code (e.g. AEE 311)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="text-xs font-mono uppercase font-bold"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                placeholder="Course Title (e.g. Aerodynamics I)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
                required
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                max="6"
                placeholder="Credit Units"
                value={newUnits}
                onChange={(e) => setNewUnits(Number(e.target.value))}
                className="text-xs font-bold"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="secondary" className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Course
            </Button>
          </div>
        </form>

        {/* Optional Official Course Registration Slip File Upload */}
        <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-2">
          <label className="block text-xs font-extrabold text-[#1F2937]">
            Upload Official AFIT Registered Course Form / Slip (PDF / Image Proof)
          </label>
          <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#1D4ED8] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#F8FAFC]">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-1">
              <Upload className="w-6 h-6 text-[#1D4ED8]" />
              <div className="text-xs font-extrabold text-[#1F2937]">
                {uploadedFile ? uploadedFile.name : 'Click or Drag Official AFIT Course Slip Here'}
              </div>
              <div className="text-[10px] text-[#6B7280]">Supports PDF, PNG, JPG (Max 5MB)</div>
            </div>
          </div>
          {uploadedFile && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mt-1">
              <FileText className="w-4 h-4 text-emerald-600" /> Attached: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Save & Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          <span className="text-xs text-[#6B7280] font-semibold">
            {courses.length} course(s) ready for peer & mentor graph cross-referencing
          </span>
          <Button onClick={handleSave} variant="primary" className="gap-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-white" /> Save Registration & Generate Peer Graph
          </Button>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
            <Users className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            Course registration saved! Peer graph updated with your active {session} course load. View matched classmates & senior mentors below.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
