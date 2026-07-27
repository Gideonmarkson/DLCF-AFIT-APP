'use client';

import React, { useState } from 'react';
import { DevotionalBanner } from '@/components/spiritual/DevotionalBanner';
import { generateStudyPlan } from '@/lib/gemini';
import { BookOpen, Calendar, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DevotionalsPage() {
  const [coursesInput, setCoursesInput] = useState('AEE 311, MET 301, EEE 301');
  const [targetCgpa, setTargetCgpa] = useState(4.50);
  const [hours, setHours] = useState(15);
  const [studyPlanMarkdown, setStudyPlanMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const courseList = coursesInput.split(',').map((c) => c.trim()).filter(Boolean);
    const result = await generateStudyPlan(courseList, targetCgpa, hours);
    setStudyPlanMarkdown(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
          Devotionals &amp; Bible Study Schedule Builder
        </h1>
        <p className="text-xs text-[#6B7280]">
          Combine daily spiritual nurture with personalized academic schedule creation tailored for AFIT coursework.
        </p>
      </div>

      <DevotionalBanner />

      {/* Bible & Academic Study Schedule Builder Form */}
      <Card className="border-[#E2E8F0] bg-white shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1D4ED8]" />
              Bible &amp; Academic Study Schedule Builder
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#6B7280]">
            Generate an active recall study &amp; scripture reflection timetable based on your specific AFIT engineering course load.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Course Codes (Comma separated)</label>
              <Input
                value={coursesInput}
                onChange={(e) => setCoursesInput(e.target.value)}
                placeholder="AEE 311, MET 301"
                className="text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Target CGPA Goal</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="5.0"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(Number(e.target.value))}
                className="text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Weekly Study Hours Available</label>
              <Input
                type="number"
                min="1"
                max="60"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="text-xs font-bold"
                required
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="primary" disabled={loading} className="gap-2 text-xs font-bold rounded-xl">
                <Calendar className="w-4 h-4" />
                {loading ? 'Building Bible & Academic Timetable...' : 'Generate Bible & Academic Study Schedule'}
              </Button>
            </div>
          </form>

          {studyPlanMarkdown && (
            <div className="mt-4 p-5 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs leading-relaxed font-sans text-[#1F2937] whitespace-pre-wrap space-y-2 animate-fadeIn shadow-xs">
              {studyPlanMarkdown}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
