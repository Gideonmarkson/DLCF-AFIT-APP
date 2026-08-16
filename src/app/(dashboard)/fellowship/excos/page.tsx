'use client';
import React, { useState, useEffect } from 'react';
import { Award, Mail, Phone, Search, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DLCF_EXCO_PORTFOLIOS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { toWhatsAppNumber } from '@/lib/utils';

interface ExcoMember {
  id: string;
  name: string;
  portfolio: string;
  department: string;
  level: string;
  cgpa: number;
  bio: string;
  initials: string;
  phone: string;
  tenureSession: string;
  avatarUrl: string | null;
}

export default function StudentExcosPage() {
  const [excos, setExcos] = useState<ExcoMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, executive_office, department, current_level, cgpa, phone_number, tenure_session, avatar_url')
        .eq('role', 'STUDENT_EXECUTIVE');

      setExcos(
        (data ?? []).map((p) => ({
          id: p.id,
          name: p.full_name ?? 'Unnamed',
          portfolio: p.executive_office ?? 'Executive',
          department: p.department ?? '—',
          level: p.current_level ? `${p.current_level}L` : '—',
          cgpa: p.cgpa ?? 0,
          bio: `Serving as ${p.executive_office ?? 'a Student Executive'} for the fellowship.`,
          initials: (p.full_name ?? 'U U')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w: string) => w[0])
            .join('')
            .toUpperCase(),
          phone: p.phone_number ?? '',
          tenureSession: p.tenure_session ?? '',
          avatarUrl: p.avatar_url ?? null,
        }))
      );
    };
    load();
  }, []);

  const filteredExcos = excos.filter((exco) => {
    const matchesSearch =
      exco.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exco.portfolio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exco.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPort = selectedPortfolio === 'ALL' || exco.portfolio === selectedPortfolio;
    return matchesSearch && matchesPort;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm">
              <Award className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                DLCF AFIT Student Executive Committee
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                Meet your Spiritually selected and appointed student leaders (200L - 500L Students) across all fellowship directorates.
              </p>
            </div>
          </div>
          <Badge variant="blue" className="hidden sm:flex gap-1 text-xs font-bold">
            AFIT Student Leaders
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
        <Input
          placeholder="Search exco by name, portfolio, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Complete Official Executive Portfolios Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-xs">
        <button
          onClick={() => setSelectedPortfolio('ALL')}
          className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
            selectedPortfolio === 'ALL' ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
          }`}
        >
          All Portfolios ({DLCF_EXCO_PORTFOLIOS.length})
        </button>
        {DLCF_EXCO_PORTFOLIOS.map((port) => (
          <button
            key={port}
            onClick={() => setSelectedPortfolio(port)}
            className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedPortfolio === port ? 'bg-[#1D4ED8] text-white' : 'bg-white border border-[#E2E8F0] text-[#4B5563]'
            }`}
          >
            {port}
          </button>
        ))}
      </div>

      {/* Excos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExcos.map((exco) => (
          <Card key={exco.id} className="border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-sm ring-4 ring-[#EFF6FF] shadow-sm flex-shrink-0 overflow-hidden">
                    {exco.avatarUrl ? (
                      <img
                        src={exco.avatarUrl}
                        alt={`${exco.name}'s profile photo`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      exco.initials
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold text-[#1F2937]">{exco.name}</CardTitle>
                    <CardDescription className="text-xs font-bold text-[#1D4ED8] mt-0.5">
                      {exco.portfolio}{exco.tenureSession ? ` · ${exco.tenureSession}` : ''}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="gold" className="font-mono text-xs">
                  CGPA {exco.cgpa.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] font-semibold">Department:</span>
                  <span className="font-bold text-[#1F2937]">{exco.department}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                  <span className="text-[#6B7280] font-semibold">Level:</span>
                  <span className="font-bold text-[#1D4ED8]">{exco.level} Student</span>
                </div>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                {exco.bio}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                {exco.phone && (
                  <a href={`tel:${exco.phone}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </Button>
                  </a>
                )}
                {toWhatsAppNumber(exco.phone) && (
                  <a href={`https://wa.me/${toWhatsAppNumber(exco.phone)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
