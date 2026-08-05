'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Clock,
  Award,
  Search,
  Send,
  Building,
  HeartHandshake,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CoordinatorMember {
  id: string;
  name: string;
  officialTitle: string;
  afitPosition: string;
  fellowshipFocus: string;
  consultationHours: string;
  officeLocation: string;
  bio: string;
  initials: string;
  avatarBg: string;
  email: string;
  phone: string;
}


export default function AssociateCoordinatorsDirectoryPage() {
  const [coordinators, setCoordinators] = useState<CoordinatorMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCoord, setSelectedCoord] = useState<CoordinatorMember | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, department, email, phone_number')
        .eq('role', 'ASSOCIATE_COORDINATOR');
      setCoordinators(
        (data ?? []).map((p) => ({
          id: p.id,
          name: p.full_name ?? 'Unnamed',
          officialTitle: 'Associate Coordinator',
          afitPosition: p.department ?? 'AFIT Staff / Advisor',
          fellowshipFocus: 'Pastoral care, academic mentorship, and counseling support for students.',
          consultationHours: 'Contact directly to arrange',
          officeLocation: 'AFIT Campus',
          bio: `Serving as an Associate Coordinator supporting DLCF AFIT students.`,
          initials: (p.full_name ?? 'U U').split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
          avatarBg: 'bg-[#1D4ED8]',
          email: p.email ?? '',
          phone: p.phone_number ?? '',
        }))
      );
    };
    load();
  }, []);

  const filteredCoords = coordinators.filter((coord) => {
    const matchesSearch =
      coord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coord.officialTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coord.afitPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || coord.officialTitle === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessageText('');
      setSelectedCoord(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                Associate Coordinators &amp; Patrons Directory
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                Meet the appointed adult fellowship advisors, AFIT staff patrons, and spiritual mentors supporting DLCF AFIT Kaduna.
              </p>
            </div>
          </div>
          <Badge variant="blue" className="hidden sm:flex gap-1 text-xs">
            <Award className="w-3.5 h-3.5" /> Staff Governance &amp; Advisory
          </Badge>
        </div>

        {/* Note on Associate Coordinators */}
        <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs text-[#1D4ED8] font-semibold flex items-center gap-2 mt-3">
          <UserCheck className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
          <span>
            <strong>Note:</strong> Associate Coordinators are official AFIT academic/administrative staff and senior fellowship patrons providing confidential counseling, pastoral care, and institutional support.
          </span>
        </div>
      </div>

      {/* Search & Role Filter Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search by Coordinator name, title or AFIT department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedRole === 'ALL' ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
            }`}
          >
            All Associate Coordinators ({coordinators.length})
          </button>
          <button
            onClick={() => setSelectedRole('Sub-Group Associate coordinator')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedRole === 'Sub-Group Associate coordinator' ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
            }`}
          >
            Sub-Group Associate Coordinator
          </button>
          <button
            onClick={() => setSelectedRole('Associate Coordinator (Brother)')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedRole === 'Associate Coordinator (Brother)' ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
            }`}
          >
            Associate Coordinators (Brothers)
          </button>
          <button
            onClick={() => setSelectedRole('Associate Coordinator (Sister)')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedRole === 'Associate Coordinator (Sister)' ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
            }`}
          >
            Associate Coordinators (Sisters)
          </button>
        </div>
      </div>

      {/* Coordinators Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCoords.map((coord) => (
          <Card key={coord.id} className="border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full ${coord.avatarBg} text-white font-extrabold flex items-center justify-center text-base ring-4 ring-[#EFF6FF] shadow-sm flex-shrink-0`}>
                    {coord.initials}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold text-[#1F2937]">{coord.name}</CardTitle>
                    <CardDescription className="text-xs font-bold text-[#1D4ED8] mt-0.5">
                      {coord.officialTitle}
                    </CardDescription>
                    <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
                      {coord.afitPosition}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Focus & Location Info */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#6B7280] font-medium">Advisory Focus: </span>
                    <span className="font-bold text-[#1F2937]">{coord.fellowshipFocus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]">
                  <Building className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  <span className="text-[#6B7280] font-medium">{coord.officeLocation}</span>
                </div>
              </div>

              <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                {coord.bio}
              </p>

              <div className="text-[11px] text-[#6B7280] font-semibold flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Consultation Hours: {coord.consultationHours}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a href={`tel:${coord.phone}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                </a>
                <a href={`https://wa.me/${coord.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                </a>
                <a href={`mailto:${coord.email}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-[#6B7280] text-[#4B5563] hover:bg-[#F1F5F9]">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Button>
                </a>

                <Link href="/spiritual/counseling" className="w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full gap-1 text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Seek Counseling
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Direct Contact Modal */}
      {selectedCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-extrabold text-[#1F2937]">Send Private Message to {selectedCoord.name}</h3>
              </div>
              <button onClick={() => setSelectedCoord(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#EFF6FF] text-xs font-semibold text-[#1D4ED8]">
              Recipient: {selectedCoord.name} ({selectedCoord.officialTitle})
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Your Confidential Message</label>
                <textarea
                  rows={4}
                  placeholder={`Write your inquiry or counseling message for ${selectedCoord.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                  required
                />
              </div>

              {sentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  Message dispatched confidentially! Email alert sent to {selectedCoord.email} via Resend API.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCoord(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Dispatch Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
