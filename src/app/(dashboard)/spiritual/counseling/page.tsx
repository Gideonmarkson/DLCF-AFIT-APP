'use client';

import React, { useEffect, useState } from 'react';
import { CounselingFormModal } from '@/components/spiritual/CounselingFormModal';
import {
  HeartHandshake,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2,
  FileText,
  Inbox,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface Ticket {
  id: string;
  student_id: string;
  subject: string;
  message: string;
  is_anonymous: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
}

interface Reply {
  id: string;
  request_id: string;
  responder_id: string;
  message: string;
  created_at: string;
}

interface StudentInfo {
  full_name: string;
  department: string;
  current_level: string | null;
  phone_number: string | null;
}

export default function CounselingPage() {
  const { userRole } = useRole();
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [studentInfo, setStudentInfo] = useState<Record<string, StudentInfo>>({});
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [responderNames, setResponderNames] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [replyText, setReplyText] = useState('');
  const [replySentSuccess, setReplySentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setMyId(user?.id ?? null);
    if (!user) { setLoading(false); return; }

    const query = isStaff
      ? supabase.from('counseling_requests').select('*').order('created_at', { ascending: false })
      : supabase.from('counseling_requests').select('*').eq('student_id', user.id).order('created_at', { ascending: false });

    const { data: ticketRows } = await query;
    const rows = (ticketRows ?? []) as Ticket[];
    setTickets(rows);
    if (rows.length > 0 && !selectedId) setSelectedId(rows[0].id);

    if (isStaff && rows.length > 0) {
      const studentIds = [...new Set(rows.map((t) => t.student_id))];
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, department, current_level, phone_number')
        .in('id', studentIds);
      const map: Record<string, StudentInfo> = {};
      (students ?? []).forEach((s) => {
        map[s.id] = { full_name: s.full_name, department: s.department, current_level: s.current_level, phone_number: s.phone_number };
      });
      setStudentInfo(map);
    }

    const ticketIds = rows.map((t) => t.id);
    if (ticketIds.length > 0) {
      const { data: replyRows } = await supabase.from('counseling_replies').select('*').in('request_id', ticketIds).order('created_at', { ascending: true });
      const grouped: Record<string, Reply[]> = {};
      (replyRows ?? []).forEach((r: Reply) => {
        grouped[r.request_id] = [...(grouped[r.request_id] ?? []), r];
      });
      setReplies(grouped);

      const responderIds = [...new Set((replyRows ?? []).map((r: Reply) => r.responder_id))];
      if (responderIds.length > 0) {
        const { data: responders } = await supabase.from('profiles').select('id, full_name').in('id', responderIds);
        const nameMap: Record<string, string> = {};
        (responders ?? []).forEach((r) => { nameMap[r.id] = r.full_name ?? 'Associate Coordinator'; });
        setResponderNames(nameMap);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff]);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  const handleUpdateStatus = async (newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    if (!selectedTicket) return;
    const supabase = createClient();
    await supabase.from('counseling_requests').update({ status: newStatus }).eq('id', selectedTicket.id);
    loadData();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket || !myId) return;

    const supabase = createClient();
    const { error } = await supabase.from('counseling_replies').insert({
      request_id: selectedTicket.id,
      responder_id: myId,
      message: replyText,
    });
    if (error) return;

    if (selectedTicket.status === 'PENDING') {
      await supabase.from('counseling_requests').update({ status: 'IN_PROGRESS' }).eq('id', selectedTicket.id);
    }

    setReplySentSuccess(true);
    setReplyText('');
    loadData();
    setTimeout(() => setReplySentSuccess(false), 2000);
  };

  const filteredTickets = tickets.filter((t) => statusFilter === 'ALL' || t.status === statusFilter);

  return (
    <div className="space-y-6 font-sans">
      {isStaff ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
                  <Inbox className="w-6 h-6 stroke-[1.75px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                      Associate Coordinator Counseling Portal
                    </h1>
                    <Badge variant="blue">Associate Coordinator Workspace</Badge>
                  </div>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Every ticket here is visible to every Associate Coordinator — respond to any of them.
                  </p>
                </div>
              </div>
              <Badge variant="gold" className="text-xs font-mono">
                {tickets.filter((t) => t.status === 'PENDING').length} Unanswered
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <Filter className="w-4 h-4 text-[#1D4ED8]" /> Filter:
            </div>
            <div className="flex items-center gap-1 text-xs">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full font-bold transition-colors ${statusFilter === s ? 'bg-[#1D4ED8] text-white' : 'bg-[#EFF6FF] text-[#6B7280]'}`}
                >
                  {s === 'ALL' ? `All (${tickets.length})` : `${s.replace('_', ' ')} (${tickets.filter((t) => t.status === s).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider px-1">
                Tickets ({filteredTickets.length})
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-xs text-[#6B7280]">Loading...</p>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#6B7280]">
                    No tickets in this filter.
                  </div>
                ) : (
                  filteredTickets.map((t) => {
                    const isSelected = t.id === selectedId;
                    const student = studentInfo[t.student_id];
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${isSelected ? 'border-[#1D4ED8] bg-[#EFF6FF] shadow-sm' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">#{t.id.slice(0, 8)}</span>
                          <Badge variant={t.status === 'PENDING' ? 'gold' : t.status === 'IN_PROGRESS' ? 'blue' : 'emerald'} className="text-[10px]">
                            {t.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs font-extrabold text-[#1F2937] line-clamp-1">{t.subject}</div>
                        <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-semibold">
                          <span>{t.is_anonymous ? 'Anonymous Submission' : student?.full_name ?? '—'}</span>
                          <span className="text-[10px] font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {selectedTicket ? (
                <Card className="border-[#E2E8F0] bg-white shadow-xs rounded-3xl space-y-4 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-extrabold text-[#1D4ED8]">#{selectedTicket.id.slice(0, 8)}</span>
                        <Badge variant={selectedTicket.status === 'PENDING' ? 'gold' : selectedTicket.status === 'IN_PROGRESS' ? 'blue' : 'emerald'} className="text-[10px]">
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                        {selectedTicket.is_anonymous && <Badge variant="slate" className="text-[10px]">Anonymous Request</Badge>}
                      </div>
                      <h2 className="text-base font-extrabold text-[#1F2937]">{selectedTicket.subject}</h2>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant={selectedTicket.status === 'IN_PROGRESS' ? 'primary' : 'outline'} onClick={() => handleUpdateStatus('IN_PROGRESS')} className="text-[11px] px-2.5 py-1 font-bold">
                        In Progress
                      </Button>
                      <Button size="sm" variant={selectedTicket.status === 'RESOLVED' ? 'primary' : 'outline'} onClick={() => handleUpdateStatus('RESOLVED')} className="text-[11px] px-2.5 py-1 font-bold">
                        Resolved
                      </Button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1F2937]">
                      <span>Student: {studentInfo[selectedTicket.student_id]?.full_name ?? '—'}</span>
                      <span className="text-[#1D4ED8] font-mono">
                        {studentInfo[selectedTicket.student_id]?.current_level ? `${studentInfo[selectedTicket.student_id]?.current_level}L` : ''} {studentInfo[selectedTicket.student_id]?.department}
                      </span>
                    </div>
                    {studentInfo[selectedTicket.student_id]?.phone_number && (
                      <div className="text-[11px] text-[#6B7280] font-semibold">
                        Contact: <span className="font-mono text-[#1F2937]">{studentInfo[selectedTicket.student_id]?.phone_number}</span>
                      </div>
                    )}
                    {selectedTicket.is_anonymous && (
                      <div className="text-[10px] text-[#9CA3AF]">Marked anonymous — hidden from other students, visible to you as the assigned coordinator.</div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] space-y-2">
                    <div className="text-xs font-extrabold text-[#1D4ED8] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Request Details:
                    </div>
                    <p className="text-xs text-[#1F2937] leading-relaxed font-medium">{selectedTicket.message}</p>
                  </div>

                  {(replies[selectedTicket.id] ?? []).length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
                        Reply Thread ({(replies[selectedTicket.id] ?? []).length})
                      </h3>
                      {(replies[selectedTicket.id] ?? []).map((r) => (
                        <div key={r.id} className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold text-emerald-800">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {responderNames[r.responder_id] ?? 'Associate Coordinator'}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono">{new Date(r.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-emerald-900 font-medium leading-relaxed">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                    <label className="block text-xs font-extrabold text-[#1F2937]">Compose Reply</label>
                    <textarea
                      rows={4}
                      placeholder="Write your response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3.5 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                      required
                    />
                    {replySentSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reply saved to the ticket.
                      </div>
                    )}
                    <div className="flex justify-end pt-1">
                      <Button type="submit" variant="primary" size="sm" className="gap-1.5 rounded-xl font-bold">
                        <Send className="w-3.5 h-3.5" /> Send Reply
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="p-12 text-center text-xs text-[#6B7280] border border-dashed border-[#CBD5E1] rounded-3xl bg-[#F8FAFC]">
                  {loading ? 'Loading...' : 'No ticket selected.'}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 tracking-tight">
              <HeartHandshake className="w-5 h-5 text-[#1D4ED8]" />
              Confidential Counseling Portal
            </h1>
            <p className="text-xs text-[#6B7280] font-medium">
              Seek private spiritual and personal guidance — every Associate Coordinator is notified and can respond.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CounselingFormModal onSuccess={loadData} />
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="border-[#E2E8F0] bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1D4ED8]" />
                    Your Counseling Request History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="text-xs text-[#6B7280]">Loading...</p>
                  ) : tickets.length === 0 ? (
                    <p className="text-xs text-[#6B7280]">You haven&apos;t submitted a request yet.</p>
                  ) : (
                    tickets.map((t) => (
                      <div key={t.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">#{t.id.slice(0, 8)}</span>
                          <Badge variant={t.status === 'RESOLVED' ? 'emerald' : 'gold'} className="text-[10px]">
                            {t.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs font-extrabold text-[#1F2937]">{t.subject}</div>
                        {(replies[t.id] ?? []).length > 0 && (
                          <div className="text-[11px] text-emerald-700 font-semibold">{(replies[t.id] ?? []).length} response(s) received</div>
                        )}
                        {t.is_anonymous && <div className="text-[10px] text-[#1D4ED8] font-mono">Submitted Anonymously</div>}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
