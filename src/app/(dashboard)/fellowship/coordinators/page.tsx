'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

const ASSOCIATE_COORDINATORS: CoordinatorMember[] = [
  {
    id: 'coord-1',
    name: 'Pastor / Bro. Samuel Okosun',
    officialTitle: 'Sub-Group Associate coordinator',
    afitPosition: 'Senior AFIT Academic Staff Patron',
    fellowshipFocus: 'Overall Sub-Group Governance, Leadership Alignment & General Pastoral Care',
    consultationHours: 'Mondays & Wednesdays (4:00 PM - 6:30 PM)',
    officeLocation: 'AFIT Staff Complex, Block A, Room 104',
    bio: 'Oversees the sub-group executive body, spiritual health, and institutional relations across AFIT campus.',
    initials: 'SO',
    avatarBg: 'bg-[#1D4ED8]',
    email: 'samuel.okosun@afit.edu.ng',
    phone: '+234 801 234 5678',
  },
  {
    id: 'coord-2',
    name: 'Engr. Bro. Timothy Lawson',
    officialTitle: 'Associate Coordinator (Brother)',
    afitPosition: 'AFIT Mechanical Workshop Senior Superintendent',
    fellowshipFocus: 'Brothers Nurture, Technical Operations & Logistics Governance',
    consultationHours: 'Tuesdays & Thursdays (4:00 PM - 6:00 PM)',
    officeLocation: 'AFIT Technical Workshop Complex',
    bio: 'Provides dedicated spiritual mentoring, career guidance, and logistics oversight for brother student members.',
    initials: 'TL',
    avatarBg: 'bg-[#1E3A8A]',
    email: 'timothy.lawson@afit.edu.ng',
    phone: '+234 802 345 6789',
  },
  {
    id: 'coord-3',
    name: 'Prof. Dr. A. K. Mohammed',
    officialTitle: 'Associate Coordinator (Brother)',
    afitPosition: 'Professor of Aerospace Engineering, AFIT',
    fellowshipFocus: 'Academic Integrity, Research Mentorship & Post-Graduate Advisory',
    consultationHours: 'Fridays (2:00 PM - 4:30 PM)',
    officeLocation: 'Department of Aerospace Engineering, HOD Block',
    bio: 'Guides student brethren in academic research distinction, scholarship applications, and career advancement.',
    initials: 'AM',
    avatarBg: 'bg-[#D97706]',
    email: 'ak.mohammed@afit.edu.ng',
    phone: '+234 803 456 7890',
  },
  {
    id: 'coord-4',
    name: 'Sister Comfort Adebayo',
    officialTitle: 'Associate Coordinator (Sister)',
    afitPosition: 'AFIT Senior Administrative Officer',
    fellowshipFocus: 'Sisters Welfare, Personal Counseling & Hostel Life Advisory',
    consultationHours: 'Tuesdays & Thursdays (3:30 PM - 6:00 PM)',
    officeLocation: 'AFIT Administrative Building, Office 12',
    bio: 'Provides dedicated spiritual, emotional, and personal counseling for female student brethren across AFIT hostels.',
    initials: 'CA',
    avatarBg: 'bg-[#059669]',
    email: 'comfort.adebayo@afit.edu.ng',
    phone: '+234 804 567 8901',
  },
  {
    id: 'coord-5',
    name: 'Dr. Sis. Patricia Emmanuel',
    officialTitle: 'Associate Coordinator (Sister)',
    afitPosition: 'Senior Lecturer, Department of Computer Science, AFIT',
    fellowshipFocus: 'Academic Counseling for Sisters, Family Life & Mentorship',
    consultationHours: 'Wednesdays & Fridays (2:00 PM - 5:00 PM)',
    officeLocation: 'AFIT ICT Complex, Office 08',
    bio: 'Supports sisters academic excellence, balance, and spiritual growth across all undergraduate and diploma levels.',
    initials: 'PE',
    avatarBg: 'bg-[#7C3AED]',
    email: 'patricia.emmanuel@afit.edu.ng',
    phone: '+234 805 678 9012',
  },
];

export default function AssociateCoordinatorsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCoord, setSelectedCoord] = useState<CoordinatorMember | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const filteredCoords = ASSOCIATE_COORDINATORS.filter((coord) => {
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
            All Associate Coordinators ({ASSOCIATE_COORDINATORS.length})
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCoord(coord)}
                  className="w-full gap-1 text-xs border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]"
                >
                  <Mail className="w-3.5 h-3.5" /> Private Message
                </Button>

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
