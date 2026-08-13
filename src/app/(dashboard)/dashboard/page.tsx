'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  MessageSquare,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Lock,
  Award,
  Users,
  ShieldAlert,
  GraduationCap,
  Inbox,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { CounselingFormModal } from '@/components/spiritual/CounselingFormModal';
import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import { AboutFellowship } from '@/components/dashboard/AboutFellowship';
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

interface MediaRow {
  id: string;
  title: string;
  speaker_or_unit: string;
  media_url: string;
  source_type: string;
  created_at: string;
}

interface ForumRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function DashboardPage() {
  const { userRole, profile } = useRole();
  const [showCounselingForm, setShowCounselingForm] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaRow[]>([]);
  const [forumPost, setForumPost] = useState<ForumRow | null>(null);

  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const ticketQuery = isStaff
        ? supabase
            .from('counseling_requests')
            .select(
              'id, subject, status, is_anonymous, student_id, profiles(full_name)'
            )
            .order('created_at', { ascending: false })
            .limit(2)
        : supabase
            .from('counseling_requests')
            .select('id, subject, status, is_anonymous, student_id')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2);

      const [
        { data: ticketData },
        { data: mediaData },
        { data: forumData },
      ] = await Promise.all([
        ticketQuery,
        supabase
          .from('media_items')
          .select('id, title, speaker_or_unit, media_url, source_type, created_at')
          .eq('category', 'SERMON_AUDIO')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('forum_posts')
          .select('id, title, content, created_at')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      setTickets((ticketData as unknown as TicketRow[]) ?? []);
      setMediaItems((mediaData as MediaRow[]) ?? []);
      setForumPost((forumData?.[0] as ForumRow) ?? null);
      setTicketsLoaded(true);
    };

    load();
  }, [isStaff]);

  return (
    <div className="relative space-y-6 font-sans">
      {/* Dashboard-wide AFIT/DLCF watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.045] z-0"
        style={{
          backgroundImage: 'url(/fellowship/dlcf-logo-badge.png)',
          backgroundSize: '42%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 space-y-6">
        <WelcomeHero
          firstName={profile.fullName.split(' ').filter(Boolean).pop() ?? ''}
        />

        <AboutFellowship />

        {/* Student Exco governance overview — real actions only, no fabricated statistics */}
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
                      Student Executive Portal
                      {profile.executiveOffice
                        ? ` (${profile.executiveOffice})`
                        : ''}
                    </h1>
                  </div>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Your governance tools and live fellowship records are available
                    from the executive queue.
                  </p>
                </div>
              </div>

              <Link href="/admin/academic-overview">
                <Button
                  variant="primary"
                  className="gap-2 shrink-0 rounded-xl"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Open Exco Governance Queue
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Associate Coordinator governance banner */}
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
                    Welcome {profile.fullName}. Managing real student counseling
                    tickets and fellowship governance records.
                  </p>
                </div>
              </div>

              <Link href="/admin/counseling-manage">
                <Button
                  variant="primary"
                  className="gap-2 shrink-0 rounded-xl"
                >
                  <Inbox className="w-4 h-4" />
                  Open Incoming Counseling Tickets Queue
                </Button>
              </Link>
            </div>

            {!ticketsLoaded ? (
              <p className="text-xs text-[#6B7280]">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#6B7280] font-medium text-center">
                No counseling tickets have been submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">
                          #{t.id.slice(0, 8)}
                        </span>
                        <Badge variant="gold" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </div>
                      <div className="text-xs font-extrabold text-[#1F2937]">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-medium">
                        {t.is_anonymous
                          ? 'Anonymous submission'
                          : `Submitted by: ${t.profiles?.full_name ?? 'Student'}`}
                      </div>
                    </div>

                    <Link href="/spiritual/counseling">
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs gap-1"
                      >
                        Respond <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Student confidential counseling portal */
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
                    Submit private spiritual &amp; personal requests directly
                    to DLCF AFIT Associate Coordinators with automated alerts.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowCounselingForm(!showCounselingForm)}
                variant="primary"
                className="gap-2 shrink-0 rounded-xl"
              >
                <Lock className="w-4 h-4" />
                {showCounselingForm
                  ? 'Hide Counseling Form'
                  : 'Seek Confidential Guidance'}
              </Button>
            </div>

            {showCounselingForm ? (
              <div className="pt-2 animate-fadeIn">
                <CounselingFormModal
                  onSuccess={() => setShowCounselingForm(false)}
                />
              </div>
            ) : !ticketsLoaded ? (
              <p className="text-xs text-[#6B7280]">Loading your tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#6B7280] font-medium text-center">
                You haven&apos;t submitted a counseling request yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#EFF6FF]/70 border border-[#1D4ED8]/20 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">
                          #{t.id.slice(0, 8)}
                        </span>
                        <Badge variant="gold" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </div>
                      <div className="text-xs font-extrabold text-[#1F2937]">
                        {t.subject}
                      </div>
                    </div>

                    <Link href="/spiritual/counseling">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8]"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Peer Mentoring */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
                Peer Mentoring Network
              </h2>
              <Link
                href="/academic/peer-network"
                className="text-[10px] font-extrabold text-[#1D4ED8] flex items-center gap-1"
              >
                Open <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-1.5">
              <Users className="w-6 h-6 text-[#9CA3AF] mx-auto" />
              <p className="text-xs text-[#6B7280] font-medium">
                Your live mentor pairing is shown in the Peer Mentorship Network.
              </p>
            </div>
          </div>

          {/* Spiritual Nurture */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
                Spiritual Nurture
              </h2>
              <Link
                href="/spiritual/devotionals"
                className="text-[10px] font-extrabold text-[#1D4ED8] flex items-center gap-1"
              >
                Open <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white space-y-3 shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                <BookOpen className="w-4 h-4 text-amber-300" />
                DEVOTIONALS
              </div>
              <div className="text-sm leading-relaxed text-blue-50 font-medium">
                Daily spiritual encouragement and the fellowship devotional
                resources are available in the Spiritual Nurture section.
              </div>
              <div className="text-[11px] text-blue-200 pt-2 border-t border-white/10 font-medium">
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
                  Message Repository
                </h3>
                <Link
                  href="/fellowship/media"
                  className="text-[10px] font-extrabold text-[#1D4ED8] flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {mediaItems.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-xs text-[#6B7280] font-medium text-center">
                  No sermon recordings have been published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {mediaItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[#EFF6FF]/70 border border-[#E2E8F0] flex items-center justify-between gap-3 hover:border-[#1D4ED8]/30 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-extrabold text-[#1F2937] truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#6B7280] font-semibold truncate">
                          {item.speaker_or_unit}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-[#1D4ED8] text-white font-extrabold text-xs shrink-0">
                        <Headphones className="w-3.5 h-3.5" /> Listen
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Departmental Forum */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1F2937] tracking-tight uppercase">
                Departmental Forum
              </h2>
              <Link
                href="/fellowship/forum"
                className="text-[10px] font-extrabold text-[#1D4ED8] flex items-center gap-1"
              >
                Open <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {!forumPost ? (
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-1.5">
                <MessageSquare className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                <p className="text-xs text-[#6B7280] font-medium">
                  No forum posts have been published yet.
                </p>
              </div>
            ) : (
              <Link
                href="/fellowship/forum"
                className="block p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#1D4ED8]/30 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1D4ED8] uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Latest Forum Post
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-[#1F2937]">
                  {forumPost.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                  {forumPost.content.length > 160
                    ? `${forumPost.content.slice(0, 157)}...`
                    : forumPost.content}
                </p>
                <div className="mt-3 text-[10px] font-semibold text-[#9CA3AF]">
                  {new Date(forumPost.created_at).toLocaleDateString()}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
