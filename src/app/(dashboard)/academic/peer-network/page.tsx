'use client';

import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Phone, MessageCircle, UserPlus, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/context/RoleContext';
import { holdsOffice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface PersonRow {
  id: string;
  full_name: string;
  department: string;
  current_level: string | null;
  cgpa: number;
  phone_number: string | null;
}

export default function PeerMentorshipPage() {
  const { profile } = useRole();
  const isAcademicDirector = holdsOffice(profile.executiveOffice, profile.additionalOffices, 'Academic Director');

  const [myPairing, setMyPairing] = useState<{ mentor: PersonRow } | null>(null);
  const [unpaired, setUnpaired] = useState<PersonRow[]>([]);
  const [mentors, setMentors] = useState<PersonRow[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    if (!isAcademicDirector) {
      const { data: pairing } = await supabase
        .from('mentor_pairings')
        .select('mentor_id')
        .eq('student_id', user.id)
        .maybeSingle();

      if (pairing?.mentor_id) {
        const { data: mentor } = await supabase
          .from('profiles')
          .select('id, full_name, department, current_level, cgpa, phone_number')
          .eq('id', pairing.mentor_id)
          .single();
        if (mentor) setMyPairing({ mentor });
      }
    } else {
      const { data: allPairings } = await supabase.from('mentor_pairings').select('student_id');
      const pairedIds = new Set((allPairings ?? []).map((p) => p.student_id));

      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, department, current_level, cgpa, phone_number')
        .eq('role', 'GENERAL_STUDENT')
        .order('cgpa', { ascending: true });
      setUnpaired((students ?? []).filter((s) => !pairedIds.has(s.id)));

      const { data: highAchievers } = await supabase
        .from('profiles')
        .select('id, full_name, department, current_level, cgpa, phone_number')
        .in('role', ['GENERAL_STUDENT', 'STUDENT_EXECUTIVE'])
        .gte('cgpa', 4.0);
      setMentors(highAchievers ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAcademicDirector]);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedStudentId || !selectedMentorId) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: pairError } = await supabase.from('mentor_pairings').upsert({
      student_id: selectedStudentId,
      mentor_id: selectedMentorId,
      paired_by: user.id,
    });

    if (pairError) {
      setError(pairError.message);
      return;
    }
    setSuccess(true);
    setSelectedStudentId('');
    setSelectedMentorId('');
    loadData();
    setTimeout(() => setSuccess(false), 2000);
  };

  const filteredUnpaired = unpaired.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  if (isAcademicDirector) {
    return (
      <div className="space-y-6 font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1D4ED8]" /> Peer Mentorship Pairing — Academic Director
          </h1>
          <p className="text-xs text-[#6B7280] font-medium">
            Pair students with a strong senior mentor (CGPA 4.00+). Once paired, the student sees this on their own dashboard.
          </p>
        </div>

        <Card className="border-[#E2E8F0] bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-[#1F2937]">Create a Pairing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePair} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Student</label>
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="h-10 w-full rounded-xl border border-[#E2E8F0] text-xs px-3" required>
                  <option value="">Select unpaired student...</option>
                  {unpaired.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} — CGPA {s.cgpa.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Mentor (CGPA 4.00+)</label>
                <select value={selectedMentorId} onChange={(e) => setSelectedMentorId(e.target.value)} className="h-10 w-full rounded-xl border border-[#E2E8F0] text-xs px-3" required>
                  <option value="">Select mentor...</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name} — CGPA {m.cgpa.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" className="gap-1.5 text-xs font-bold">
                <UserPlus className="w-3.5 h-3.5" /> Pair Them
              </Button>
            </form>
            {error && <p className="text-xs text-red-600 font-bold mt-2">{error}</p>}
            {success && <p className="text-xs text-emerald-700 font-bold mt-2">Paired successfully.</p>}
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-[#1F2937]">Unpaired Students ({unpaired.length})</CardTitle>
              <div className="relative w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 text-xs" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <p className="text-xs text-[#6B7280]">Loading...</p>
            ) : filteredUnpaired.length === 0 ? (
              <p className="text-xs text-[#6B7280]">Everyone&apos;s paired, or no matches.</p>
            ) : (
              filteredUnpaired.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="font-bold text-[#1F2937]">{s.full_name}</div>
                  <div className="text-[#6B7280]">{s.department} {s.current_level ? `· ${s.current_level}L` : ''}</div>
                  <span className="font-mono font-extrabold text-[#1D4ED8]">{s.cgpa.toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1D4ED8]" /> Peer Mentorship Network
        </h1>
        <p className="text-xs text-[#6B7280] font-medium">
          Your mentor is assigned by the Academic Director based on academic standing.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-[#6B7280]">Loading...</p>
      ) : myPairing ? (
        <Card className="border-[#E2E8F0] bg-white shadow-xs">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-lg shrink-0">
              {myPairing.mentor.full_name[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-[#1F2937]">{myPairing.mentor.full_name}</div>
              <div className="text-xs text-[#6B7280] font-medium">
                {myPairing.mentor.department} {myPairing.mentor.current_level ? `· ${myPairing.mentor.current_level}L` : ''} · CGPA {myPairing.mentor.cgpa.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {myPairing.mentor.phone_number && (
                  <>
                    <a href={`tel:${myPairing.mentor.phone_number}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1"><Phone className="w-3.5 h-3.5" /> Call</Button>
                    </a>
                    <a href={`https://wa.me/${myPairing.mentor.phone_number.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs gap-1 border-emerald-600 text-emerald-700"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</Button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center space-y-3">
          <GraduationCap className="w-8 h-8 text-[#9CA3AF] mx-auto" />
          <p className="text-xs text-[#6B7280] font-medium">
            You haven&apos;t been paired with a mentor yet. The Academic Director assigns these — reach out on the Fellowship Coordinators / Excos page if you&apos;d like to follow up.
          </p>
        </div>
      )}
    </div>
  );
}
