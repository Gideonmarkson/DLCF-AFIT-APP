'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Mail, CheckCircle2, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdminCounselingTicket {
  id: string;
  studentName: string;
  matricNumber?: string;
  subject: string;
  messageSnippet: string;
  isAnonymous: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
}

const INITIAL_QUEUE: AdminCounselingTicket[] = [
  {
    id: 't-101',
    studentName: 'Brother Joseph Chukwu',
    matricNumber: 'AFIT/ENG/AEE/2021/042',
    subject: 'Academic Pressure & Spiritual Direction in 300L',
    messageSnippet: 'Brethren, I am struggling to balance my 300L Aerodynamics coursework with my fellowship responsibilities...',
    isAnonymous: false,
    status: 'PENDING',
    date: '2026-07-25',
  },
  {
    id: 't-102',
    studentName: 'Anonymous Brethren',
    subject: 'Personal Prayer Guidance',
    messageSnippet: 'Please pray with me concerning family challenges and financial strain this semester...',
    isAnonymous: true,
    status: 'IN_PROGRESS',
    date: '2026-07-22',
  },
];

export default function CounselingManagePage() {
  const [queue, setQueue] = useState<AdminCounselingTicket[]>(INITIAL_QUEUE);

  const handleResolve = (id: string) => {
    setQueue(
      queue.map((t) => (t.id === id ? { ...t, status: 'RESOLVED' } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          Associate Coordinator Counseling Response Queue
        </h1>
        <p className="text-xs text-slate-400">
          Encrypted private inbox for assigned Associate Coordinators. Dispatched automatically via Resend API.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Sender Identity</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Message Snippet</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queue.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-xs text-cyan-400 font-bold">#{ticket.id}</TableCell>
              <TableCell className="text-xs">
                {ticket.isAnonymous ? (
                  <span className="font-semibold text-amber-400">Anonymous Brethren</span>
                ) : (
                  <div>
                    <div className="font-semibold text-slate-100">{ticket.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ticket.matricNumber}</div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-xs font-semibold text-slate-200">{ticket.subject}</TableCell>
              <TableCell className="text-xs text-slate-300 max-w-xs truncate">{ticket.messageSnippet}</TableCell>
              <TableCell>
                <Badge variant={ticket.status === 'RESOLVED' ? 'emerald' : 'amber'} className="text-[10px]">
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {ticket.status !== 'RESOLVED' ? (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleResolve(ticket.id)}
                    className="text-xs gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </Button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Closed Ticket</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
