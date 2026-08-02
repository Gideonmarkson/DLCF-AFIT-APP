'use client';

import React, { useState, useEffect } from 'react';
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
import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface TicketRow {
  id: string;
  subject: string;
  status: string;
  is_anonymous: boolean;
  student_id: string;
  profiles?: { full_name: string | null } | null;
}

export default function DashboardPage() {
  const { userRole, profile } = useRole();
  const [likes, setLikes] = useState<Record<string, number>>({ p1: 14, p2: 8, p3: 21 });
  const [showCounselingForm, setShowCounselingForm] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = isStaff
        ? supabase.from('counseling_requests').select('id, subject, status, is_anonymous, student_id, profiles(full_name)').order('created_at', { ascending: false }).limit(2)
        : supabase.from('counseling_requests').select('id, subject, status, is_anonymous, student_id').eq('student_id', user.id).order('created_at', { ascending: false }).limit(2);

      const { data } = await query;
      setTickets((data as unknown as TicketRow[]) ?? []);
      setTicketsLoaded(true);
    };
    load();
  }, [isStaff]);

  const toggleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="space-y-6 font-sans">

      <WelcomeHero firstName={profile.fullName.split(' ').filter(Boolean).pop() ?? ''} />

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
                    Student Executive Portal {profile.executiveOffice ? `(${profile.executiveOffice})` : ''}
                  </h1>
                  <Badge variant="role">Student Exco</Badge>
                </div>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Welcome {profile.fullName} ({profile.currentLevel ? `${profile.currentLevel}L ` : ''}{profile.department ?? ''}, CGPA {profile.cgpa.toFixed(2)}). Managing {profile.executiveOffice ?? 'academic mentorship & fellowship unit'} performance.
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
                  Welcome {profile.fullName}. Managing student counseling tickets, academic interventions, and fellowship patronage.
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
          {!ticketsLoaded ? (
            <p className="text-xs text-[#6B7280]">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#6B7280] font-medium text-center">
              No counseling tickets have been submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">#{t.id.slice(0, 8)}</span>
                      <Badge variant="gold" className="text-[10px]">{t.status}</Badge>
                    </div>
                    <div className="text-xs font-extrabold text-[#1F2937]">{t.subject}</div>
                    <div className="text-[11px] text-[#6B7280] font-medium">
                      {t.is_anonymous ? 'Anonymous submission' : `Submitted by: ${t.profiles?.full_name ?? 'Student'}`}
                    </div>
                  </div>
                  <Link href="/spiritual/counseling">
                    <Button size="sm" variant="primary" className="text-xs gap-1">
                      Respond <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
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
          ) : !ticketsLoaded ? (
            <p className="text-xs text-[#6B7280]">Loading your tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#6B7280] font-medium text-center">
              You haven&apos;t submitted a counseling request yet.
            </div>
          ) : (
            /* Active Counseling Ticket Status Summary Banner */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">#{t.id.slice(0, 8)}</span>
                      <Badge variant="gold" className="text-[10px]">{t.status}</Badge>
                    </div>
                    <div className="text-xs font-extrabold text-[#1F2937]">{t.subject}</div>
                  </div>
                  <Link href="/spiritual/counseling">
                    <Button size="sm" variant="outline" className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8]">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3-Column Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= COLUMN 1: PEER MENTORING NETWORK ================= */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            Peer Mentoring Network
          </h2>
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-1.5">
            <Users className="w-6 h-6 text-[#9CA3AF] mx-auto" />
            <p className="text-xs text-[#6B7280] font-medium">
              Mentor pairing isn&apos;t built yet — this will show your real matched senior once that feature ships.
            </p>
          </div>
        </div>

        {/* ================= COLUMN 2: SPIRITUAL NURTURE ================= */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            SPIRITUAL NURTURE
          </h2>

          {/* Styled Scripture Card for Daily Manna */}
          <a
            href="https://www.dailymanna.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white space-y-3 shadow-md hover:shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
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
            <div className="text-[11px] text-blue-200 pt-2 border-t border-white/10 font-medium flex items-center justify-between">
              <span>Standing saintly in holiness and academic excellence.</span>
              <span className="font-extrabold text-white shrink-0 ml-2">Read Today&apos;s Devotional →</span>
            </div>
          </a>

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
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
            Departmental Forum
          </h2>
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-1.5">
            <MessageSquare className="w-6 h-6 text-[#9CA3AF] mx-auto" />
            <p className="text-xs text-[#6B7280] font-medium">
              No posts yet — the forum is ready for real discussion once the first person posts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
