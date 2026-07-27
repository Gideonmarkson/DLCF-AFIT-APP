'use client';

import React, { useState, useEffect } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Award, Clock, ExternalLink, Search, CheckCircle2, Filter, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useRole } from '@/context/RoleContext';

interface Scholarship {
  id: string;
  title: string;
  sponsor: string;
  category: 'FEDERAL' | 'CORPORATE' | 'STEM' | 'ALUMNI' | 'NEED_BASED';
  awardAmount: string;
  eligibility: string;
  deadlineDate: Date;
  applyUrl: string;
  requirements: string[];
}

const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sch-1',
    title: 'PTDF National Undergraduate Scholarship Scheme',
    sponsor: 'Petroleum Technology Development Fund (PTDF)',
    category: 'FEDERAL',
    awardAmount: '₦250,000 / Annum + Laptop Allowance',
    eligibility: 'Open to 200L - 400L AFIT Engineering & Applied Science Students with CGPA >= 3.00',
    deadlineDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 3600 * 1000 + 32 * 60 * 1000), // 5 days 14 hours
    applyUrl: 'https://ptdf.gov.ng',
    requirements: ['Official AFIT Result Slip', 'Local Govt Identification Letter', 'Level Registration Form'],
  },
  {
    id: 'sch-2',
    title: 'MTN Science & Technology Scholarship (STSS)',
    sponsor: 'MTN Nigeria Foundation',
    category: 'STEM',
    awardAmount: '₦200,000 / Annum till Graduation',
    eligibility: 'All 300L AFIT Engineering, Computer Science & Cyber Security Students with CGPA >= 3.50',
    deadlineDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 8 * 3600 * 1000 + 15 * 60 * 1000), // 12 days 8 hours
    applyUrl: 'https://www.mtn.ng/scholarships',
    requirements: ['Valid Student ID Card', 'CGPA Verification Form', 'Passport Photograph'],
  },
  {
    id: 'sch-3',
    title: 'NNPC / Chevron National University Award',
    sponsor: 'Chevron Nigeria Limited / NNPC Joint Venture',
    category: 'CORPORATE',
    awardAmount: '₦150,000 / Annum',
    eligibility: 'All 200L - 500L AFIT Aerospace, Mechanical, Electrical & Civil Engineering Students',
    deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000 + 45 * 60 * 1000), // 2 days 4 hours (Urgent!)
    applyUrl: 'https://www.chevron.com/nigeriascholarship',
    requirements: ['JAMB Admission Letter', 'AFIT Matriculation Slip', 'Transcript / Result Sheet'],
  },
  {
    id: 'sch-4',
    title: 'AFIT Alumni Emergency Academic Assistance Grant',
    sponsor: 'AFIT Kaduna Alumni Association',
    category: 'ALUMNI',
    awardAmount: '₦100,000 One-Off Tuition Grant',
    eligibility: 'All AFIT Undergraduate & ND/HND Students facing financial hardship (Verified by DLCF)',
    deadlineDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 18 * 3600 * 1000 + 10 * 60 * 1000), // 1 day 18 hours (Urgent!)
    applyUrl: 'https://afit.edu.ng/alumni-grant',
    requirements: ['DLCF Associate Coordinator Recommendation', 'Semester Course Slip'],
  },
  {
    id: 'sch-5',
    title: 'Federal Government Bilateral Education Board Award',
    sponsor: 'Federal Ministry of Education (Federal Scholarship Board)',
    category: 'FEDERAL',
    awardAmount: 'Full Tuition + Monthly Living Allowance',
    eligibility: 'All 100L - 400L AFIT Degree Students with CGPA >= 4.00',
    deadlineDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 6 * 3600 * 1000), // 25 days
    applyUrl: 'https://education.gov.ng/fsb',
    requirements: ['WAEC/NECO Certificate', 'AFIT Academic Transcript', 'State of Origin Certificate'],
  },
];

// Helper to format remaining time
function calculateTimeLeft(targetDate: Date) {
  const difference = targetDate.getTime() - new Date().getTime();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

export default function ScholarshipsPage() {
  const { userRole } = useRole();
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';
  const isAcademicDirector = userRole === 'STUDENT_EXECUTIVE';

  // Allowed: System Administrator OR Academic Director (Student Exco)
  const canPostScholarship = isAdmin || isAcademicDirector;

  const [scholarships, setScholarships] = useState<Scholarship[]>(INITIAL_SCHOLARSHIPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [timeState, setTimeState] = useState<Record<string, ReturnType<typeof calculateTimeLeft>>>({});

  // Add Scholarship Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newCategory, setNewCategory] = useState<'FEDERAL' | 'CORPORATE' | 'STEM' | 'ALUMNI' | 'NEED_BASED'>('FEDERAL');
  const [newAward, setNewAward] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newDays, setNewDays] = useState(14);
  const [newUrl, setNewUrl] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Real-time countdown ticker updating every second
  useEffect(() => {
    const updateAllTimers = () => {
      const updated: Record<string, ReturnType<typeof calculateTimeLeft>> = {};
      scholarships.forEach((item) => {
        updated[item.id] = calculateTimeLeft(item.deadlineDate);
      });
      setTimeState(updated);
    };

    updateAllTimers();
    const interval = setInterval(updateAllTimers, 1000);
    return () => clearInterval(interval);
  }, [scholarships]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSponsor || !newAward) return;

    const newItem: Scholarship = {
      id: Date.now().toString(),
      title: newTitle,
      sponsor: newSponsor,
      category: newCategory,
      awardAmount: newAward,
      eligibility: newEligibility || 'All AFIT Degree & Diploma Students',
      deadlineDate: new Date(Date.now() + Number(newDays) * 24 * 60 * 60 * 1000),
      applyUrl: newUrl || 'https://afit.edu.ng',
      requirements: ['AFIT Student ID Card', 'Level Course Slip', 'Academic Result Sheet'],
    };

    setScholarships([newItem, ...scholarships]);
    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setNewTitle('');
      setNewSponsor('');
      setNewAward('');
      setNewEligibility('');
      setNewUrl('');
    }, 1200);
  };

  const filteredScholarships = scholarships.filter((sch) => {
    const matchesSearch =
      sch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.sponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.eligibility.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || sch.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <Award className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                Scholarships, Grants &amp; Financial Aid Opportunities
              </h1>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Verified federal, corporate, and alumni scholarship opportunities with real-time countdown deadline reminders for all AFIT students.
              </p>
            </div>
          </div>

          {/* Add Scholarship Button: PERMITTED FOR SYSTEM ADMIN & ACADEMIC DIRECTOR */}
          {canPostScholarship && (
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              className="gap-2 shrink-0 rounded-xl font-bold text-xs"
            >
              <Plus className="w-4 h-4" /> Post Scholarship Alert ({isAdmin ? 'System Admin' : 'Academic Director'})
            </Button>
          )}
        </div>
      </div>

      {/* Academic Sub-Navigation Tabs */}
      <AcademicSubNav />

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search by scholarship title, sponsor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs font-semibold">
            <option value="ALL">All Categories</option>
            <option value="FEDERAL">Federal Govt Scholarships</option>
            <option value="STEM">STEM &amp; Engineering Awards</option>
            <option value="CORPORATE">Oil &amp; Corporate Grants</option>
            <option value="ALUMNI">Alumni Emergency Grants</option>
          </Select>
        </div>
      </div>

      {/* Scholarships List with Live Countdown Timers */}
      <div className="space-y-4">
        {filteredScholarships.map((sch) => {
          const timer = timeState[sch.id] || calculateTimeLeft(sch.deadlineDate);
          const isUrgent = timer.days < 3 && !timer.expired;

          return (
            <Card
              key={sch.id}
              className={`border bg-white shadow-xs hover:shadow-md transition-all ${
                isUrgent ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E2E8F0]'
              }`}
            >
              <CardContent className="p-6 space-y-4 font-sans">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={sch.category === 'FEDERAL' ? 'blue' : sch.category === 'STEM' ? 'gold' : 'slate'}>
                        {sch.category} SCHOLARSHIP
                      </Badge>
                      {isUrgent && (
                        <Badge variant="rose" className="gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Closing Soon!
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-[#1F2937]">{sch.title}</h3>
                    <p className="text-xs text-[#6B7280] font-semibold mt-0.5">{sch.sponsor}</p>
                  </div>

                  {/* Real-Time Live Countdown Timer Display */}
                  <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 flex items-center gap-3 shrink-0">
                    <Clock className={`w-5 h-5 ${isUrgent ? 'text-amber-600 animate-spin' : 'text-[#1D4ED8]'}`} />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">
                        Application Deadline Countdown
                      </div>
                      {timer.expired ? (
                        <div className="text-xs font-extrabold text-rose-600">Application Closed</div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-[#1D4ED8] mt-0.5">
                          <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">{timer.days}d</span>
                          <span>:</span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">{String(timer.hours).padStart(2, '0')}h</span>
                          <span>:</span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">{String(timer.minutes).padStart(2, '0')}m</span>
                          <span>:</span>
                          <span className="bg-white px-[#1.5] py-0.5 rounded-md border border-[#1D4ED8] text-[#1D4ED8]">{String(timer.seconds).padStart(2, '0')}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <div className="text-[#6B7280] font-semibold">Award Value &amp; Benefit:</div>
                    <div className="text-sm font-extrabold text-[#D97706]">{sch.awardAmount}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <div className="text-[#6B7280] font-semibold">AFIT Student Eligibility:</div>
                    <div className="font-bold text-[#1F2937] leading-relaxed">{sch.eligibility}</div>
                  </div>
                </div>

                {/* Requirements & Direct Apply Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-[#6B7280] font-extrabold">Requirements:</span>
                    {sch.requirements.map((req, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1F2937] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#1D4ED8]/20">
                        <CheckCircle2 className="w-3 h-3 text-[#1D4ED8]" /> {req}
                      </span>
                    ))}
                  </div>

                  <a href={sch.applyUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button variant="primary" size="sm" className="gap-1.5 w-full sm:w-auto font-bold rounded-xl">
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Scholarship Modal (SYSTEM ADMIN & ACADEMIC DIRECTOR) */}
      {showAddModal && canPostScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-extrabold text-[#1F2937]">
                  Post New Scholarship Alert ({isAdmin ? 'System Admin' : 'Academic Director'})
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Scholarship Title</label>
                <Input
                  placeholder="e.g. Shell Nigeria University Scholarship Scheme"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Sponsor / Organization</label>
                <Input
                  placeholder="e.g. Shell Petroleum Development Company (SPDC)"
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Category</label>
                  <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="text-xs">
                    <option value="FEDERAL">Federal Govt</option>
                    <option value="STEM">STEM &amp; Engineering</option>
                    <option value="CORPORATE">Oil &amp; Corporate</option>
                    <option value="ALUMNI">Alumni Grant</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Deadline (Days from now)</label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Award Value / Benefit</label>
                <Input
                  placeholder="e.g. ₦200,000 / Annum + Educational Stipend"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  className="text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Student Eligibility</label>
                <Input
                  placeholder="e.g. Open to 200L-400L AFIT Students with CGPA >= 3.50"
                  value={newEligibility}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Application Portal URL</label>
                <Input
                  type="url"
                  placeholder="https://www.shell.com.ng/scholarships"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              {addSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  Scholarship alert published successfully! Live countdown timer active.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5 font-bold">
                  <Plus className="w-3.5 h-3.5" /> Publish Scholarship Alert
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
