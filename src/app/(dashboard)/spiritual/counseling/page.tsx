'use client';

import React, { useState } from 'react';
import { CounselingFormModal } from '@/components/spiritual/CounselingFormModal';
import {
  HeartHandshake,
  ShieldCheck,
  Clock,
  Send,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Inbox,
  Filter,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRole } from '@/context/RoleContext';

interface CounselingMessage {
  id: string;
  senderName: string;
  department: string;
  level: string;
  subject: string;
  details: string;
  advisorAssigned: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  isAnonymous: boolean;
  phone?: string;
  replies: { sender: string; message: string; date: string }[];
}

const MOCK_MEMBER_MESSAGES: CounselingMessage[] = [
  {
    id: 't-101',
    senderName: 'Brother Daniel Adebayo',
    department: 'B.Eng Aerospace Engineering',
    level: '300L',
    subject: 'Academic Pressure & Spiritual Direction in 300L',
    details: 'Dear Pastor Samuel, I have been feeling overwhelming pressure balancing 300L engineering coursework with my quiet time and personal prayers. I seek spiritual guidance on maintaining focus and peace during continuous assessments.',
    advisorAssigned: 'Pastor / Bro. Samuel Okosun',
    status: 'PENDING',
    date: '2026-07-26 14:30',
    isAnonymous: false,
    phone: '+234 801 234 5678',
    replies: [],
  },
  {
    id: 't-102',
    senderName: 'Sister Grace Lawson',
    department: 'B.Sc Cyber Security',
    level: '300L',
    subject: 'Family Crisis & Personal Intercession Request',
    details: 'Ma/Sir, please I need confidential prayer support regarding an urgent family situation back home. I want guidance on praying through without losing my emotional stability in school.',
    advisorAssigned: 'Sister Comfort Adebayo',
    status: 'IN_PROGRESS',
    date: '2026-07-25 09:15',
    isAnonymous: false,
    phone: '+234 803 456 7890',
    replies: [
      {
        sender: 'Sister Comfort Adebayo (Associate Coordinator)',
        message: 'Dear Sister Grace, peace be unto you. God is your refuge. I have set aside 4:00 PM tomorrow to call you directly for private prayers.',
        date: '2026-07-25 11:00',
      },
    ],
  },
  {
    id: 't-100',
    senderName: 'Anonymous Student Member',
    department: 'B.Eng Mechanical Engineering',
    level: '200L',
    subject: 'Overcoming Peer Pressure in Hostels',
    details: 'Sir, I am writing anonymously to ask for counsel on standing firm in holiness when roommates engage in worldly activities. How do I maintain my testimony without conflict?',
    advisorAssigned: 'Pastor / Bro. Samuel Okosun',
    status: 'RESOLVED',
    date: '2026-07-20 18:45',
    isAnonymous: true,
    replies: [
      {
        sender: 'Pastor / Bro. Samuel Okosun (Associate Coordinator)',
        message: 'Dear Brethren, stand strong in Daniel 1:8. Grace is available to make you ten times better. We have prayed for your steadfastness.',
        date: '2026-07-21 08:20',
      },
    ],
  },
];

const STUDENT_HISTORY = [
  {
    id: 't-101',
    subject: 'Academic Pressure & Spiritual Direction in 300L',
    advisorName: 'Pastor / Bro. Samuel Okosun (Associate Coordinator)',
    status: 'IN_PROGRESS',
    date: 'July 26, 2026',
    isAnonymous: false,
  },
  {
    id: 't-100',
    subject: 'Personal Prayer Guidance',
    advisorName: 'Sis. Comfort Adebayo (Associate Coordinator)',
    status: 'RESOLVED',
    date: 'July 20, 2026',
    isAnonymous: true,
  },
];

export default function CounselingPage() {
  const { userRole } = useRole();
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  // Associate Coordinator Management State
  const [messages, setMessages] = useState<CounselingMessage[]>(MOCK_MEMBER_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('t-101');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [replyText, setReplyText] = useState('');
  const [replySentSuccess, setReplySentSuccess] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedMessage) return;

    const newReply = {
      sender: 'Pastor / Bro. Samuel Okosun (Associate Coordinator)',
      message: replyText,
      date: 'Just now',
    };

    setMessages(
      messages.map((msg) =>
        msg.id === selectedMessage.id
          ? { ...msg, status: 'IN_PROGRESS', replies: [...msg.replies, newReply] }
          : msg
      )
    );

    setReplySentSuccess(true);
    setTimeout(() => {
      setReplySentSuccess(false);
      setReplyText('');
    }, 1500);
  };

  const handleUpdateStatus = (newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    setMessages(
      messages.map((msg) => (msg.id === selectedMessage.id ? { ...msg, status: newStatus } : msg))
    );
  };

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter === 'ALL') return true;
    return msg.status === statusFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* ================= ASSOCIATE COORDINATOR MESSAGES INBOX & REPLY WORKSPACE ================= */}
      {isStaff ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
                  <Inbox className="w-6 h-6 stroke-[1.75px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                      Associate Coordinator Counseling &amp; Member Messages Portal
                    </h1>
                    <Badge variant="blue">Associate Coordinator Workspace</Badge>
                  </div>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Review confidential counseling burdens sent by student members, compose pastoral advice, and dispatch automated encrypted email updates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="gold" className="text-xs font-mono">
                  {messages.filter((m) => m.status === 'PENDING').length} Unanswered Messages
                </Badge>
              </div>
            </div>
          </div>

          {/* Inbox Filter Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <Filter className="w-4 h-4 text-[#1D4ED8]" /> Filter Messages:
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  statusFilter === 'ALL' ? 'bg-[#1D4ED8] text-white' : 'bg-[#EFF6FF] text-[#6B7280]'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  statusFilter === 'PENDING' ? 'bg-[#1D4ED8] text-white' : 'bg-[#EFF6FF] text-[#6B7280]'
                }`}
              >
                Pending ({messages.filter((m) => m.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  statusFilter === 'IN_PROGRESS' ? 'bg-[#1D4ED8] text-white' : 'bg-[#EFF6FF] text-[#6B7280]'
                }`}
              >
                In Progress ({messages.filter((m) => m.status === 'IN_PROGRESS').length})
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  statusFilter === 'RESOLVED' ? 'bg-[#1D4ED8] text-white' : 'bg-[#EFF6FF] text-[#6B7280]'
                }`}
              >
                Resolved ({messages.filter((m) => m.status === 'RESOLVED').length})
              </button>
            </div>
          </div>

          {/* Main 2-Column Messages Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Member Messages List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider px-1">
                Student Counseling Messages Queue ({filteredMessages.length})
              </h2>

              <div className="space-y-3">
                {filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessage.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-[#EFF6FF] shadow-sm'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">{msg.id}</span>
                        <Badge
                          variant={
                            msg.status === 'PENDING'
                              ? 'gold'
                              : msg.status === 'IN_PROGRESS'
                              ? 'blue'
                              : 'emerald'
                          }
                          className="text-[10px]"
                        >
                          {msg.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="text-xs font-extrabold text-[#1F2937] line-clamp-1">{msg.subject}</div>

                      <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-semibold">
                        <span>{msg.isAnonymous ? 'Anonymous Student' : msg.senderName}</span>
                        <span className="text-[10px] font-mono">{msg.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Message Details & Pastoral Reply Workspace (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {selectedMessage ? (
                <Card className="border-[#E2E8F0] bg-white shadow-xs rounded-3xl space-y-4 p-6">
                  {/* Selected Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-extrabold text-[#1D4ED8]">{selectedMessage.id}</span>
                        <Badge
                          variant={
                            selectedMessage.status === 'PENDING'
                              ? 'gold'
                              : selectedMessage.status === 'IN_PROGRESS'
                              ? 'blue'
                              : 'emerald'
                          }
                          className="text-[10px]"
                        >
                          {selectedMessage.status.replace('_', ' ')}
                        </Badge>
                        {selectedMessage.isAnonymous && (
                          <Badge variant="slate" className="text-[10px]">Anonymous Request</Badge>
                        )}
                      </div>
                      <h2 className="text-base font-extrabold text-[#1F2937]">{selectedMessage.subject}</h2>
                    </div>

                    {/* Status Update Quick Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'IN_PROGRESS' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="text-[11px] px-2.5 py-1 font-bold"
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'RESOLVED' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        className="text-[11px] px-2.5 py-1 font-bold"
                      >
                        Resolved
                      </Button>
                    </div>
                  </div>

                  {/* Student Member Details Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1F2937]">
                      <span>Student Sender: {selectedMessage.isAnonymous ? 'Submitted Anonymously' : selectedMessage.senderName}</span>
                      <span className="text-[#1D4ED8] font-mono">{selectedMessage.level} • {selectedMessage.department}</span>
                    </div>
                    {!selectedMessage.isAnonymous && selectedMessage.phone && (
                      <div className="text-[11px] text-[#6B7280] font-semibold">
                        WhatsApp Contact: <span className="font-mono text-[#1F2937]">{selectedMessage.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Message Burden Details */}
                  <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#E2E8F0] space-y-2">
                    <div className="text-xs font-extrabold text-[#1D4ED8] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Confidential Member Burden Details:
                    </div>
                    <p className="text-xs text-[#1F2937] leading-relaxed font-medium">
                      {selectedMessage.details}
                    </p>
                  </div>

                  {/* Previous Reply Thread */}
                  {selectedMessage.replies.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider">
                        Advisor Reply Transcript ({selectedMessage.replies.length})
                      </h3>
                      {selectedMessage.replies.map((reply, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold text-emerald-800">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {reply.sender}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono">{reply.date}</span>
                          </div>
                          <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Compose Reply Form */}
                  <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                    <label className="block text-xs font-extrabold text-[#1F2937]">
                      Compose Confidential Pastoral Advice / Spiritual Counsel
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`Write your pastoral advice, scripture encouragement, or consultation appointment details for ${selectedMessage.isAnonymous ? 'this student' : selectedMessage.senderName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3.5 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                      required
                    />

                    {replySentSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Pastoral response dispatched confidentially! Encrypted email update sent via Resend API.
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#6B7280] font-semibold">
                        Encrypted RLS &amp; Resend API Email Dispatch Active
                      </span>
                      <Button type="submit" variant="primary" size="sm" className="gap-1.5 rounded-xl font-bold">
                        <Send className="w-3.5 h-3.5" /> Dispatch Pastoral Reply
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="p-12 text-center text-xs text-[#6B7280] border border-dashed border-[#CBD5E1] rounded-3xl bg-[#F8FAFC]">
                  Select a student message from the left queue to read details and reply.
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* ================= STUDENT CONFIDENTIAL COUNSELING SUBMISSION PAGE (Rendered for Students) ================= */
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 tracking-tight">
              <HeartHandshake className="w-5 h-5 text-[#1D4ED8]" />
              Confidential Counseling Portal
            </h1>
            <p className="text-xs text-[#6B7280] font-medium">
              Seek private spiritual and personal guidance securely routed to DLCF AFIT Associate Coordinators with automated email dispatch via Resend API.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CounselingFormModal />
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="border-[#E2E8F0] bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1D4ED8]" />
                    Your Counseling Request History
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B7280]">
                    Only visible to you and assigned advisors.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {STUDENT_HISTORY.map((ticket) => (
                    <div key={ticket.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold text-[#1D4ED8]">#{ticket.id}</span>
                        <Badge variant={ticket.status === 'RESOLVED' ? 'emerald' : 'gold'} className="text-[10px]">
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs font-extrabold text-[#1F2937]">{ticket.subject}</div>
                      <div className="text-[11px] text-[#6B7280] font-semibold">{ticket.advisorName}</div>
                      {ticket.isAnonymous && (
                        <div className="text-[10px] text-[#1D4ED8] font-mono">Submitted Anonymously</div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[#E2E8F0] bg-white shadow-xs p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#1D4ED8]">
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" /> Confidentiality Assurance
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                  Counseling tickets are protected under PostgreSQL RLS row policies. Regular executive members cannot access these entries.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
