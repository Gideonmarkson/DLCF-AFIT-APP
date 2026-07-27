'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  ThumbsDown,
  MoreHorizontal,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Lock,
  Award,
  Users,
  ShieldAlert,
  GraduationCap,
  Inbox,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { CounselingFormModal } from '@/components/spiritual/CounselingFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRole } from '@/context/RoleContext';

export default function DashboardPage() {
  const { userRole } = useRole();
  const [likes, setLikes] = useState<Record<string, number>>({ p1: 14, p2: 8, p3: 21 });
  const [showCounselingForm, setShowCounselingForm] = useState(false);

  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  const toggleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ================= STUDENT EXCO GOVERNANCE OVERVIEW (Rendered ONLY for Student Excos) ================= */}
      {isExco && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
                <Award className="w-6 h-6 stroke-[1.75px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                    Student Executive Portal (Academic Directorate)
                  </h1>
                  <Badge variant="role">Student Exco</Badge>
                </div>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Welcome Sister Blessing Adeyemi (400L Mechanical Engineering, CGPA 4.75). Managing academic mentorship &amp; fellowship unit performance.
                </p>
              </div>
            </div>

            <Link href="/admin/academic-overview">
              <Button variant="primary" className="gap-2 shrink-0 rounded-xl">
                <ShieldAlert className="w-4 h-4" /> Open Exco Governance Queue
              </Button>
            </Link>
          </div>

          {/* Executive Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] font-semibold">Tracked Student Brethren</div>
                <div className="text-base font-extrabold font-mono text-[#1F2937]">248 Active Students</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] font-semibold">At-Risk Interventions (&lt; 2.50)</div>
                <div className="text-base font-extrabold font-mono text-rose-600">3 Flagged Students</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-[#1D4ED8] text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] font-semibold">Active Senior Mentors (&gt;= 4.00)</div>
                <div className="text-base font-extrabold font-mono text-[#1D4ED8]">42 Paired Mentors</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ASSOCIATE COORDINATOR GOVERNANCE BANNER (Rendered ONLY for Staff Associate Coordinators) ================= */}
      {isStaff ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[1.75px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                    Associate Coordinator Governance Portal
                  </h1>
                  <Badge variant="role">Associate Coordinator</Badge>
                </div>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Welcome Pastor / Bro. Samuel Okosun. Managing student counseling tickets, academic interventions, and fellowship patronage.
                </p>
              </div>
            </div>

            <Link href="/admin/counseling-manage">
              <Button variant="primary" className="gap-2 shrink-0 rounded-xl">
                <Inbox className="w-4 h-4" /> Open Incoming Counseling Tickets Queue
              </Button>
            </Link>
          </div>

          {/* Associate Coordinator Incoming Tickets Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">Ticket #T-101</span>
                  <Badge variant="gold" className="text-[10px]">REQUIRES ADVISOR RESPONSE</Badge>
                </div>
                <div className="text-xs font-extrabold text-[#1F2937]">Academic Pressure &amp; Spiritual Direction in 300L</div>
                <div className="text-[11px] text-[#6B7280] font-medium">Submitted by: Student Member (Bro. Daniel Adebayo)</div>
              </div>
              <Link href="/spiritual/counseling">
                <Button size="sm" variant="primary" className="text-xs gap-1">
                  Respond <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold text-emerald-700">Ticket #T-100</span>
                  <Badge variant="emerald" className="text-[10px]">RESOLVED BY ADVISOR</Badge>
                </div>
                <div className="text-xs font-extrabold text-[#1F2937]">Personal Prayer &amp; Guidance Request</div>
                <div className="text-[11px] text-emerald-800 font-medium">Responded by: Sis. Comfort Adebayo (Associate Coordinator)</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-extrabold">
                <UserCheck className="w-4 h-4" /> Answered
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STUDENT CONFIDENTIAL COUNSELING PORTAL (Rendered ONLY for Students) ================= */
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center border border-[#1D4ED8]/20 shadow-xs flex-shrink-0">
                <HeartHandshake className="w-6 h-6 stroke-[1.75px]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2">
                  CONFIDENTIAL COUNSELING PORTAL
                  <Badge variant="blue">Encrypted Routing</Badge>
                </h2>
                <p className="text-xs text-[#6B7280] font-medium">
                  Submit private spiritual &amp; personal requests directly to DLCF AFIT Associate Coordinators with automated Resend API alerts.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCounselingForm(!showCounselingForm)}
              variant="primary"
              className="gap-2 shrink-0 rounded-xl"
            >
              <Lock className="w-4 h-4" />
              {showCounselingForm ? 'Hide Counseling Form' : 'Seek Confidential Guidance'}
            </Button>
          </div>

          {/* Expandable Counseling Form on Dashboard */}
          {showCounselingForm ? (
            <div className="pt-2 animate-fadeIn">
              <CounselingFormModal onSuccess={() => setShowCounselingForm(false)} />
            </div>
          ) : (
            /* Active Counseling Ticket Status Summary Banner */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">Ticket #T-101</span>
                    <Badge variant="gold" className="text-[10px]">IN PROGRESS</Badge>
                  </div>
                  <div className="text-xs font-extrabold text-[#1F2937]">Academic Pressure &amp; Spiritual Direction in 300L</div>
                  <div className="text-[11px] text-[#6B7280] font-medium">Assigned to: Bro. Samuel Okosun (Associate Advisor)</div>
                </div>
                <Link href="/spiritual/counseling">
                  <Button size="sm" variant="outline" className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8]">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold text-emerald-700">Ticket #T-100</span>
                    <Badge variant="emerald" className="text-[10px]">RESOLVED</Badge>
                  </div>
                  <div className="text-xs font-extrabold text-[#1F2937]">Personal Prayer Guidance Request</div>
                  <div className="text-[11px] text-emerald-800 font-medium">Assigned to: Sis. Comfort Adebayo (Associate Advisor)</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-extrabold">
                  <ShieldCheck className="w-4 h-4" /> Private
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Column Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= COLUMN 1: YOUR PEER MENTORING NETWORK ================= */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            YOUR PEER MENTORING NETWORK (AEE 311)
          </h2>

          {/* SENIOR MENTORS SECTION */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D4ED8] uppercase tracking-wider">
              SENIOR MENTORS (AEE 311)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Senior Mentor 1 */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] text-center flex flex-col items-center space-y-2">
                <div className="relative w-14 h-14 rounded-full bg-[#1D4ED8] text-white font-extrabold text-base flex items-center justify-center ring-4 ring-amber-400 shadow-md">
                  DA
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#1F2937]">Brother Daniel Adebayo</div>
                  <div className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block mt-1">
                    Grade A
                  </div>
                </div>
                <button className="w-full py-1.5 px-3 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-extrabold text-xs hover:bg-[#1D4ED8] hover:text-white transition-colors">
                  Message
                </button>
              </div>

              {/* Senior Mentor 2 */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] text-center flex flex-col items-center space-y-2">
                <div className="relative w-14 h-14 rounded-full bg-[#1F2937] text-white font-extrabold text-base flex items-center justify-center ring-4 ring-amber-400 shadow-md">
                  FO
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#1F2937]">Sister Faith Ogundele</div>
                  <div className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block mt-1">
                    Grade B
                  </div>
                </div>
                <button className="w-full py-1.5 px-3 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-extrabold text-xs hover:bg-[#1D4ED8] hover:text-white transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE CLASS PEERS SECTION */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-extrabold text-[#1D4ED8] uppercase tracking-wider">
              ACTIVE CLASS PEERS (AEE 311)
            </h3>

            <div className="space-y-3">
              {/* Peer 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EFF6FF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    BA
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Brother Adebayo</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">300L Classmate</div>
                  </div>
                </div>
                <button className="py-1 px-3 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-bold text-xs hover:bg-[#1D4ED8] hover:text-white transition-colors">
                  Study Pair
                </button>
              </div>

              {/* Peer 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EFF6FF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1F2937] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    SF
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Sister Faith</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">300L Classmate</div>
                  </div>
                </div>
                <button className="py-1 px-3 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-bold text-xs hover:bg-[#1D4ED8] hover:text-white transition-colors">
                  Study Pair
                </button>
              </div>

              {/* Peer 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EFF6FF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D97706] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    SO
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Sister Ogundele</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">300L Classmate</div>
                  </div>
                </div>
                <button className="py-1 px-3 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-bold text-xs hover:bg-[#1D4ED8] hover:text-white transition-colors">
                  Study Pair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: SPIRITUAL NURTURE ================= */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            SPIRITUAL NURTURE
          </h2>

          {/* Styled Scripture Card for Daily Manna */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-blue-200">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-300" /> DAILY MANNA
              </span>
              <span>July 27, 2026</span>
            </div>
            <div>
              <div className="text-xs font-mono font-extrabold text-amber-300">DANIEL 1:17-20</div>
              <p className="text-xs leading-relaxed mt-1.5 text-blue-100 font-medium">
                &ldquo;As for these four children, God gave them knowledge and skill in all learning and wisdom: and Daniel had understanding in all visions and dreams.&rdquo;
              </p>
            </div>
            <div className="text-[11px] text-blue-200 pt-2 border-t border-white/10 font-medium">
              Standing saintly in holiness and academic excellence. God grants supernatural wisdom to those who walk in His grace.
            </div>
          </div>

          {/* MESSAGE REPOSITORY SECTION */}
          <div className="space-y-3 pt-1 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
              MESSAGE REPOSITORY
            </h3>

            <div className="space-y-3">
              {/* Sermon Item 1 */}
              <div className="p-3.5 rounded-2xl bg-[#EFF6FF]/70 border border-[#E2E8F0] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-[#1F2937]">The Secret of Excellence</div>
                  <div className="text-[10px] text-[#6B7280] font-semibold">Pastor / Bro. Samuel Okosun • 45 mins</div>
                </div>
                <button className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-[#1D4ED8] text-white font-extrabold text-xs shadow-2xs hover:bg-[#1E40AF] transition-colors">
                  <Headphones className="w-3.5 h-3.5" /> Listen
                </button>
              </div>

              {/* Sermon Item 2 */}
              <div className="p-3.5 rounded-2xl bg-[#EFF6FF]/70 border border-[#E2E8F0] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-[#1F2937]">The Master Student (300L)</div>
                  <div className="text-[10px] text-[#6B7280] font-semibold">Prof. Dr. A. K. Mohammed • 52 mins</div>
                </div>
                <button className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-[#1D4ED8] text-white font-extrabold text-xs shadow-2xs hover:bg-[#1E40AF] transition-colors">
                  <Headphones className="w-3.5 h-3.5" /> Listen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: DEPARTMENTAL FORUM ================= */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            DEPARTMENTAL FORUM (Aerospace Engineering 300L)
          </h2>

          {/* Posts Feed */}
          <div className="space-y-4">
            {/* Post 1 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    SO
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Brother Samuel Okoh</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">3 months ago</div>
                  </div>
                </div>
                <button className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
                Brother discuss who is wrong and who is right to understand our ongoing course, and connect at the table.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#E2E8F0]">
                <button onClick={() => toggleLike('p1')} className="flex items-center gap-1 hover:text-[#1D4ED8] font-bold">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#1D4ED8]" /> {likes.p1}
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937] ml-auto">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Post 2 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    SO
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Brother Samuel Okoh</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">3 months ago</div>
                  </div>
                </div>
                <button className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
                Ongoing discussions regarding aerodynamics with Aerospace Engineering 300L course problem sets.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#E2E8F0]">
                <button onClick={() => toggleLike('p2')} className="flex items-center gap-1 hover:text-[#1D4ED8] font-bold">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#1D4ED8]" /> {likes.p2}
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937] ml-auto">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Post 3 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D97706] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    SO
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">Brother Samuel Okoh</div>
                    <div className="text-[10px] text-[#6B7280] font-semibold">3 months ago</div>
                  </div>
                </div>
                <button className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
                Thanks to all ongoing discussion regarding aerodynamics and fellowship study groups on this dashboard.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#E2E8F0]">
                <button onClick={() => toggleLike('p3')} className="flex items-center gap-1 hover:text-[#1D4ED8] font-bold">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#1D4ED8]" /> {likes.p3}
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937] ml-auto">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 hover:text-[#1F2937]">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
