'use client';

import React, { useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Users, GraduationCap, Award, BookOpen, Search, UserCheck, ShieldCheck, HeartHandshake, CheckCircle2, Sparkles, Filter, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';

interface StudentMentor {
  id: string;
  name: string;
  department: string;
  level: string;
  cgpa: number;
  coursesHandled: string[];
  initials: string;
  whatsapp: string;
}

const SENIOR_MENTORS: StudentMentor[] = [
  {
    id: 'm-1',
    name: 'Bro. Daniel Adebayo',
    department: 'B.Eng Aerospace Engineering',
    level: '500L',
    cgpa: 4.82,
    coursesHandled: ['AEE 311 - Aerodynamics I', 'MET 301 - Fluid Mechanics II', 'MAT 301 - Engineering Math'],
    initials: 'DA',
    whatsapp: '+234 801 234 5678',
  },
  {
    id: 'm-2',
    name: 'Sis. Blessing Adeyemi',
    department: 'B.Eng Electrical & Electronics',
    level: '400L',
    cgpa: 4.75,
    coursesHandled: ['EEE 301 - Applied Electronics', 'MAT 301 - Advanced Math'],
    initials: 'BA',
    whatsapp: '+234 802 345 6789',
  },
  {
    id: 'm-3',
    name: 'Bro. Samuel Okoh',
    department: 'B.Eng Mechanical Engineering',
    level: '500L',
    cgpa: 4.68,
    coursesHandled: ['MET 301 - Fluid Mechanics II', 'AEE 311 - Aerodynamics I'],
    initials: 'SO',
    whatsapp: '+234 803 456 7890',
  },
];

export default function PeerNetworkPage() {
  const { userRole } = useRole();
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

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
              Peer Mentorship Graph is Reserved for AFIT Students
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-md mx-auto">
              As an Associate Coordinator, your portal is designated for pastoral care, counseling ticket responses, and fellowship advisory.
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

  const handlePairRequest = (id: string) => {
    if (!requestedIds.includes(id)) {
      setRequestedIds([...requestedIds, id]);
    }
  };

  const filteredMentors = SENIOR_MENTORS.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.coursesHandled.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse =
      selectedCourse === 'ALL' || mentor.coursesHandled.some((c) => c.includes(selectedCourse));
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Academic SubNav */}
      <AcademicSubNav />

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <Users className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                Peer Mentorship Network &amp; Academic Study Graph
              </h1>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Connect with verified AFIT senior brethren (&gt;= 4.00 CGPA) for course tutorials, study pairing, and academic mentorship.
              </p>
            </div>
          </div>

          <Link href="/academic/course-registration">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl font-bold border-[#1D4ED8] text-[#1D4ED8]">
              <GraduationCap className="w-4 h-4" /> Course Registration Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search mentors by name, department, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="text-xs font-semibold">
            <option value="ALL">All Enrolled Courses</option>
            <option value="AEE 311">AEE 311 - Aerodynamics I</option>
            <option value="MET 301">MET 301 - Fluid Mechanics II</option>
            <option value="EEE 301">EEE 301 - Applied Electronics</option>
            <option value="MAT 301">MAT 301 - Engineering Math</option>
          </Select>
        </div>
      </div>

      {/* Senior Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMentors.map((mentor) => {
          const isRequested = requestedIds.includes(mentor.id);
          return (
            <Card key={mentor.id} className="border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-sm ring-4 ring-[#EFF6FF] shadow-sm shrink-0">
                      {mentor.initials}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-extrabold text-[#1F2937]">{mentor.name}</CardTitle>
                      <CardDescription className="text-xs font-semibold text-[#6B7280] mt-0.5">
                        {mentor.department} ({mentor.level})
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="gold" className="font-mono text-xs">
                    CGPA {mentor.cgpa.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-extrabold text-[#1F2937]">Mentorship &amp; Tutorial Courses:</span>
                  <div className="space-y-1 pt-1">
                    {mentor.coursesHandled.map((course, i) => (
                      <div key={i} className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] text-[#1D4ED8] font-bold">
                        {course}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <Button
                    onClick={() => handlePairRequest(mentor.id)}
                    variant={isRequested ? 'outline' : 'primary'}
                    disabled={isRequested}
                    className="w-full text-xs font-bold gap-1.5 rounded-xl"
                  >
                    {isRequested ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Study Pair Request Sent
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" /> Request Study Pairing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
