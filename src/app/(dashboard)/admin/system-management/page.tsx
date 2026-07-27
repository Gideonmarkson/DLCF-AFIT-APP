'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  Server,
  Activity,
  FileCheck,
  Send,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  UserPlus,
  BarChart3,
  Mail,
  Sliders,
  Database,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useRole } from '@/context/RoleContext';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'GENERAL_STUDENT' | 'STUDENT_EXECUTIVE' | 'ASSOCIATE_COORDINATOR' | 'SYSTEM_ADMINISTRATOR';
  portfolioOrTitle: string;
  department: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  joinedDate: string;
}

const MOCK_USERS: SystemUser[] = [
  {
    id: 'usr-001',
    name: 'Brother Daniel Adebayo',
    email: 'daniel.adebayo@gmail.com',
    phone: '+234 801 234 5678',
    role: 'GENERAL_STUDENT',
    portfolioOrTitle: '300L Student Member',
    department: 'B.Eng Aerospace Engineering',
    status: 'ACTIVE',
    joinedDate: '2026-01-15',
  },
  {
    id: 'usr-002',
    name: 'Sister Blessing Adeyemi',
    email: 'blessing.adeyemi@gmail.com',
    phone: '+234 802 345 6789',
    role: 'STUDENT_EXECUTIVE',
    portfolioOrTitle: 'Academic Director (Exco)',
    department: 'B.Eng Mechanical Engineering',
    status: 'ACTIVE',
    joinedDate: '2026-01-10',
  },
  {
    id: 'usr-003',
    name: 'Pastor / Bro. Samuel Okosun',
    email: 'samuel.okosun@afit.edu.ng',
    phone: '+234 803 456 7890',
    role: 'ASSOCIATE_COORDINATOR',
    portfolioOrTitle: 'Sub-Group Associate coordinator',
    department: 'AFIT Senior Staff Patron',
    status: 'ACTIVE',
    joinedDate: '2025-11-20',
  },
  {
    id: 'usr-004',
    name: 'Brother Gideon Olamide',
    email: 'gideon.olamide@gmail.com',
    phone: '+234 805 678 9012',
    role: 'STUDENT_EXECUTIVE',
    portfolioOrTitle: 'General Coordinator',
    department: 'B.Eng Electrical Engineering',
    status: 'ACTIVE',
    joinedDate: '2025-10-05',
  },
  {
    id: 'usr-005',
    name: 'Sister Comfort Adebayo',
    email: 'comfort.adebayo@afit.edu.ng',
    phone: '+234 806 789 0123',
    role: 'ASSOCIATE_COORDINATOR',
    portfolioOrTitle: 'Associate Coordinator (Sister)',
    department: 'AFIT Staff Patron',
    status: 'ACTIVE',
    joinedDate: '2025-11-22',
  },
];

const MOCK_AUDIT_LOGS = [
  { id: 'log-101', action: 'ROLE_PROMOTION', details: 'Promoted Sis. Blessing Adeyemi to Student Exco (Academic Director)', admin: 'Super Admin', timestamp: '2026-07-27 14:15' },
  { id: 'log-100', action: 'PASSCODE_ROTATION', details: 'Rotated Associate Coordinator Security Key to DLCF-STAFF-PASSCODE-2026', admin: 'Super Admin', timestamp: '2026-07-26 18:30' },
  { id: 'log-099', action: 'VERIFICATION_APPROVED', details: 'Approved Course Slip for Bro. Daniel Adebayo (AEE 311)', admin: 'Super Admin', timestamp: '2026-07-25 11:05' },
];

export default function SystemManagementPage() {
  const { userRole, setUserRole } = useRole();
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USER_MANAGEMENT' | 'SECURITY' | 'BROADCAST' | 'AUDIT_LOGS'>('OVERVIEW');
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Security Keys State
  const [excoPasscode, setExcoPasscode] = useState('DLCF-EXCO-2026');
  const [coordinatorPasscode, setCoordinatorPasscode] = useState('DLCF-STAFF-PASSCODE-2026');
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);

  // Broadcast Message State
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleUpdateRole = (userId: string, newRole: 'GENERAL_STUDENT' | 'STUDENT_EXECUTIVE' | 'ASSOCIATE_COORDINATOR' | 'SYSTEM_ADMINISTRATOR') => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleSavePasscodes = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeSuccess(true);
    setTimeout(() => setPasscodeSuccess(false), 2000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastBody) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastSubject('');
      setBroadcastBody('');
    }, 2000);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // STRICT ACCESS GUARD: Renders Access Denied if current user perspective is NOT System Administrator
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6 text-center font-sans">
        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1F2937]">System Administrator Access Required</h1>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              The System Administration Control Center is strictly restricted to System Administrators. Students, Exco Leaders, and Associate Coordinators cannot access this portal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs text-[#1D4ED8] font-bold">
            To view this page for demonstration, switch your perspective to <span className="underline">System Admin</span> in the top-right header role switcher.
          </div>

          <Button
            onClick={() => setUserRole('SYSTEM_ADMINISTRATOR')}
            variant="primary"
            className="w-full text-xs font-bold gap-2 rounded-xl py-2.5"
          >
            <Server className="w-4 h-4" /> Switch to System Administrator Perspective
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
              <Server className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                  System Administration &amp; High-Level Control Center
                </h1>
                <Badge variant="blue">Super Admin Access</Badge>
              </div>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Manage user role accreditations, system passcodes, RLS security enforcement, Resend email broadcasts, and platform analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="gap-1 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'OVERVIEW' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1D4ED8]'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> System Overview
        </button>

        <button
          onClick={() => setActiveTab('USER_MANAGEMENT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'USER_MANAGEMENT' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1D4ED8]'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'SECURITY' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1D4ED8]'
          }`}
        >
          <Key className="w-4 h-4" /> Passcodes &amp; RLS Security
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'BROADCAST' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1D4ED8]'
          }`}
        >
          <Mail className="w-4 h-4" /> Email Broadcast Center
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === 'AUDIT_LOGS' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1D4ED8]'
          }`}
        >
          <Activity className="w-4 h-4" /> System Audit Trail
        </button>
      </div>

      {/* ================= TAB 1: SYSTEM OVERVIEW ================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#E2E8F0] bg-white p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-semibold">
                <span>Total Active Users</span>
                <Users className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#1F2937]">248</div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12% this semester
              </div>
            </Card>

            <Card className="border-[#E2E8F0] bg-white p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-semibold">
                <span>Appointed Exco Leaders</span>
                <Badge variant="role" className="text-[10px]">19 Portfolios</Badge>
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#1D4ED8]">19 / 19</div>
              <div className="text-[11px] text-[#6B7280] font-medium">Full Executive Roster Active</div>
            </Card>

            <Card className="border-[#E2E8F0] bg-white p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-semibold">
                <span>Associate Coordinators</span>
                <Badge variant="blue" className="text-[10px]">Patrons</Badge>
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#1F2937]">3</div>
              <div className="text-[11px] text-[#6B7280] font-medium">Sub-Group, Brother &amp; Sister</div>
            </Card>

            <Card className="border-[#E2E8F0] bg-white p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-semibold">
                <span>Counseling Resolution Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-600">100%</div>
              <div className="text-[11px] text-emerald-700 font-bold">14 Tickets Answered</div>
            </Card>
          </div>

          {/* System Health Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Database & Infrastructure Status */}
            <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1D4ED8]" /> Database &amp; Security Infrastructure
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-bold text-[#1F2937]">PostgreSQL Row-Level Security (RLS)</span>
                  <Badge variant="emerald">ENFORCED &amp; ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-bold text-[#1F2937]">Resend API Email Service</span>
                  <Badge variant="emerald">CONNECTED (VERIFIED)</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-bold text-[#1F2937]">Document Proof Storage (Result Slips)</span>
                  <Badge variant="emerald">ENCRYPTED BUCKET</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-bold text-[#1F2937]">Gemini AI Timetable Engine</span>
                  <Badge variant="blue">ACTIVE &amp; OPERATIONAL</Badge>
                </div>
              </div>
            </Card>

            {/* Quick Administrative Shortcuts */}
            <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1D4ED8]" /> Administrative Actions
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Button
                  onClick={() => setActiveTab('USER_MANAGEMENT')}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2 rounded-2xl border-[#E2E8F0] hover:border-[#1D4ED8]"
                >
                  <Users className="w-5 h-5 text-[#1D4ED8]" />
                  <span className="font-bold">Manage User Roles</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('SECURITY')}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2 rounded-2xl border-[#E2E8F0] hover:border-[#1D4ED8]"
                >
                  <Key className="w-5 h-5 text-[#D97706]" />
                  <span className="font-bold">Rotate Passcodes</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('BROADCAST')}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2 rounded-2xl border-[#E2E8F0] hover:border-[#1D4ED8]"
                >
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">Dispatch Broadcast</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('AUDIT_LOGS')}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2 rounded-2xl border-[#E2E8F0] hover:border-[#1D4ED8]"
                >
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="font-bold">View Audit Trail</span>
                </Button>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === 'USER_MANAGEMENT' && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937]">User Roles &amp; Accreditation Management</h2>
              <p className="text-xs text-[#6B7280]">
                Search members, promote/demote access levels, and assign executive portfolios or staff accreditation.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="Search user, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs w-48"
                />
              </div>

              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-xs font-bold w-40">
                <option value="ALL">All Roles</option>
                <option value="GENERAL_STUDENT">Students</option>
                <option value="STUDENT_EXECUTIVE">Exco Leaders</option>
                <option value="ASSOCIATE_COORDINATOR">Coordinators</option>
              </Select>
            </div>
          </div>

          {/* User Roster Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#6B7280] font-extrabold uppercase">
                  <th className="py-3 px-3">Member Details</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Portfolio / Designation</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-[#1F2937]">{user.name}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{user.email} • {user.phone}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge
                        variant={
                          user.role === 'ASSOCIATE_COORDINATOR'
                            ? 'blue'
                            : user.role === 'STUDENT_EXECUTIVE'
                            ? 'role'
                            : 'slate'
                        }
                        className="text-[10px]"
                      >
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#1F2937]">
                      {user.portfolioOrTitle}
                      <div className="text-[10px] text-[#6B7280]">{user.department}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge variant="emerald" className="text-[10px]">{user.status}</Badge>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                          className="text-[11px] py-1 h-8 font-bold w-36"
                        >
                          <option value="GENERAL_STUDENT">Student</option>
                          <option value="STUDENT_EXECUTIVE">Exco Leader</option>
                          <option value="ASSOCIATE_COORDINATOR">Coordinator</option>
                          <option value="SYSTEM_ADMINISTRATOR">System Admin</option>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= TAB 3: PASSCODES & SECURITY ================= */}
      {activeTab === 'SECURITY' && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-6 shadow-xs animate-fadeIn max-w-2xl">
          <div>
            <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#1D4ED8]" /> Security Passcodes &amp; Accreditation Keys
            </h2>
            <p className="text-xs text-[#6B7280]">
              Rotate authorization keys required for Student Leader (Exco) and Associate Coordinator accreditation.
            </p>
          </div>

          <form onSubmit={handleSavePasscodes} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">
                Student Executive Accreditation Passcode
              </label>
              <Input
                type="text"
                value={excoPasscode}
                onChange={(e) => setExcoPasscode(e.target.value)}
                className="text-xs font-mono font-bold uppercase"
                required
              />
              <p className="text-[11px] text-[#6B7280]">Required at `/register/exco` for student leader sign-up.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">
                Associate Coordinator Security Key
              </label>
              <Input
                type="text"
                value={coordinatorPasscode}
                onChange={(e) => setCoordinatorPasscode(e.target.value)}
                className="text-xs font-mono font-bold uppercase"
                required
              />
              <p className="text-[11px] text-[#6B7280]">Required at `/register/coordinator` for staff advisor sign-up.</p>
            </div>

            {passcodeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Security passcodes updated successfully!
              </div>
            )}

            <Button type="submit" variant="primary" className="text-xs font-bold rounded-xl gap-2">
              <Lock className="w-4 h-4" /> Save Updated Passcodes
            </Button>
          </form>
        </Card>
      )}

      {/* ================= TAB 4: EMAIL BROADCAST CENTER ================= */}
      {activeTab === 'BROADCAST' && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-6 shadow-xs animate-fadeIn max-w-2xl">
          <div>
            <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1D4ED8]" /> Resend API Fellowship Email Broadcast
            </h2>
            <p className="text-xs text-[#6B7280]">
              Dispatch official announcements directly to all 248 registered DLCF AFIT members.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">Broadcast Announcement Subject</label>
              <Input
                placeholder="e.g. Special Fellowship Service Announcement & Academic Briefing"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">Message Body</label>
              <textarea
                rows={5}
                placeholder="Dear Brethren, praise the Lord! Please be informed that..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3.5 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                required
              />
            </div>

            {broadcastSent && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Broadcast dispatched to 248 members via Resend API!
              </div>
            )}

            <Button type="submit" variant="primary" className="text-xs font-bold rounded-xl gap-2">
              <Send className="w-4 h-4" /> Dispatch Email Broadcast
            </Button>
          </form>
        </Card>
      )}

      {/* ================= TAB 5: AUDIT LOGS ================= */}
      {activeTab === 'AUDIT_LOGS' && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs animate-fadeIn">
          <div>
            <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1D4ED8]" /> System Audit Trail &amp; Governance Logs
            </h2>
            <p className="text-xs text-[#6B7280]">Immutable system event log for security &amp; compliance tracking.</p>
          </div>

          <div className="space-y-3">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#1D4ED8]">{log.id}</span>
                    <Badge variant="blue" className="text-[10px]">{log.action}</Badge>
                  </div>
                  <div className="font-extrabold text-[#1F2937]">{log.details}</div>
                  <div className="text-[11px] text-[#6B7280]">Performed by: {log.admin}</div>
                </div>
                <span className="text-[11px] font-mono text-[#6B7280]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
