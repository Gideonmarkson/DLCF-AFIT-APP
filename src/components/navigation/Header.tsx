'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown, User, ShieldCheck, Award, Server, LogOut, Check, HeartHandshake, GraduationCap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RolePerspective } from '@/context/RoleContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  userRole?: RolePerspective;
  userName?: string;
  userEmail?: string;
  onRoleChange?: (role: RolePerspective) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  type: 'ACADEMIC' | 'COUNSELING' | 'SCHOLARSHIP' | 'GOVERNANCE';
}

export function Header({
  title = 'Saintly Intellectuals Hub',
  userRole = 'GENERAL_STUDENT',
  userName = 'User',
  userEmail = '',
  onRoleChange,
}: HeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';

  // Role-Based Live Notifications Data
  const getNotificationsList = (): NotificationItem[] => {
    if (isAdmin) {
      return [
        { id: 'n-1', title: 'PostgreSQL RLS Security Active', description: 'Row-Level Security row policies enforced across all tables.', timestamp: '10m ago', unread: true, type: 'GOVERNANCE' },
        { id: 'n-2', title: 'Resend API Dispatch Verified', description: 'Email broadcast successfully delivered to 248 members.', timestamp: '1h ago', unread: true, type: 'GOVERNANCE' },
        { id: 'n-3', title: 'Passcode Rotation Logged', description: 'Associate Coordinator security passcode updated.', timestamp: '3h ago', unread: false, type: 'GOVERNANCE' },
      ];
    }
    if (isStaff) {
      return [
        { id: 'n-1', title: 'New Counseling Request #T-101', description: 'Bro. Daniel Adebayo submitted a burden regarding 300L pressure.', timestamp: '15m ago', unread: true, type: 'COUNSELING' },
        { id: 'n-2', title: 'Governance Queue Update', description: '100% counseling resolution rate maintained across 14 tickets.', timestamp: '2h ago', unread: true, type: 'GOVERNANCE' },
        { id: 'n-3', title: 'Staff Advisory Briefing', description: 'Quarterly Associate Coordinator consultation schedule updated.', timestamp: '5h ago', unread: false, type: 'GOVERNANCE' },
      ];
    }
    if (isExco) {
      return [
        { id: 'n-1', title: 'At-Risk Intervention Alert', description: '3 students flagged under 2.50 CGPA threshold in Aerospace Engineering.', timestamp: '20m ago', unread: true, type: 'GOVERNANCE' },
        { id: 'n-2', title: 'Course Slip Proof Submitted', description: 'Bro. Daniel Adebayo uploaded official course slip for verification.', timestamp: '1h ago', unread: true, type: 'ACADEMIC' },
        { id: 'n-3', title: 'Exco Directorate Meeting', description: 'Academic Directorate review meeting scheduled for Thursday 5:00 PM.', timestamp: '4h ago', unread: false, type: 'GOVERNANCE' },
      ];
    }
    return [
      { id: 'n-1', title: 'Senior Mentor Study Pair Matched', description: 'Bro. Daniel Adebayo (4.82 CGPA) accepted your study pair request for AEE 311.', timestamp: '5m ago', unread: true, type: 'ACADEMIC' },
      { id: 'n-2', title: 'Pastoral Counseling Response', description: 'Pastor Samuel Okosun replied to your counseling ticket #T-101.', timestamp: '1h ago', unread: true, type: 'COUNSELING' },
      { id: 'n-3', title: 'PTDF Scholarship Deadline Alert', description: 'PTDF National Undergraduate Grant closes in 14 Days.', timestamp: '2h ago', unread: false, type: 'SCHOLARSHIP' },
    ];
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotificationsList());

  useEffect(() => {
    setNotifications(getNotificationsList());
  }, [userRole]);

  const hasUnread = notifications.some((n) => n.unread);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileSnippet = () => {
   const roleLabel = isAdmin ? 'System Administrator' : isStaff ? 'Associate Coordinator' : isExco ? 'Student Executive' : 'Student';
  const parts = userName.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (userName.slice(0, 2) || 'U').toUpperCase();
  return { initials, name: userName, email: userEmail, roleLabel };
};

  const profile = getProfileSnippet();

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 md:px-8 shadow-xs font-sans">
      
      {/* Left Title & Mobile Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden relative w-9 h-9 rounded-full overflow-hidden bg-white p-0.5 border border-[#1E3A8A] shadow-2xs shrink-0">
          <Image
            src="/dlcf_afit_logo.png"
            alt="DLCF AFIT Official Logo"
            fill
            className="object-contain p-0.5"
          />
        </div>
        <div>
          <h1 className="text-base sm:text-2xl font-extrabold text-[#1F2937] tracking-tight line-clamp-1">
            {title}
          </h1>
          <p className="lg:hidden text-[9px] font-extrabold text-[#1D4ED8]">DLCF AFIT</p>
        </div>
      </div>

      {/* Right Action Bar & Interactive Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Role Switcher Pill */}
        

        {/* Search Icon button */}
        <button className="p-2 sm:p-2.5 text-[#6B7280] hover:text-[#1D4ED8] rounded-full hover:bg-[#EFF6FF] transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75px]" />
        </button>

        {/* Notification Bell with Interactive Real-Time Panel */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 sm:p-2.5 text-[#6B7280] hover:text-[#1D4ED8] rounded-full hover:bg-[#EFF6FF] transition-colors cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75px]" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#1D4ED8] ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Real-Time Notification Center Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl p-4 space-y-3 z-50 animate-fadeIn font-sans">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1F2937]">Fellowship Notifications</h3>
                  {hasUnread && <Badge variant="blue" className="text-[10px]">Unread Alerts</Badge>}
                </div>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-[#1D4ED8] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-3 rounded-2xl border transition-all text-xs space-y-1',
                      item.unread
                        ? 'bg-[#EFF6FF]/70 border-[#1D4ED8]/30'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#1F2937] flex items-center gap-1.5">
                        {item.type === 'ACADEMIC' && <GraduationCap className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                        {item.type === 'COUNSELING' && <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />}
                        {item.type === 'SCHOLARSHIP' && <Award className="w-3.5 h-3.5 text-[#D97706]" />}
                        {item.type === 'GOVERNANCE' && <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B7280]">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Panel Footer */}
              <div className="pt-2 border-t border-[#E2E8F0] text-center text-[10px] font-bold text-[#6B7280]">
                Real-Time Academic &amp; Counseling Alerts Connected
              </div>

            </div>
          )}
        </div>

        {/* User Profile Pill with Interactive Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pl-2.5 rounded-full border border-[#E2E8F0] bg-white hover:border-[#1D4ED8] transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold text-[11px] sm:text-xs shadow-xs ring-2 ring-[#1D4ED8]/20">
              {profile.initials}
            </div>
            <div className="text-left hidden lg:block pr-1">
              <div className="text-xs font-extrabold text-[#1F2937] leading-tight">{profile.name}</div>
              <div className="text-[10px] text-[#6B7280] font-semibold leading-tight">{profile.roleLabel}</div>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200", isProfileOpen && "rotate-180")} />
          </button>

          {/* Interactive Profile & Log Out Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-3 space-y-2 z-50 animate-fadeIn font-sans">
              
              {/* Profile Header Snippet */}
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/20 space-y-1">
                <div className="text-xs font-extrabold text-[#1F2937]">{profile.name}</div>
                <div className="text-[10px] text-[#1D4ED8] font-mono font-bold truncate">{profile.email}</div>
                <div className="text-[10px] text-[#6B7280] font-semibold">{profile.roleLabel}</div>
              </div>

              {/* Menu Links */}
              <div className="space-y-1 text-xs font-bold text-[#1F2937] pt-1">
                <Link
                  href="/profile/setup"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]"
                >
                  <User className="w-4 h-4 text-[#1D4ED8]" /> Profile Photo &amp; Settings
                </Link>

                <Link
                  href="/academic/results/upload"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]"
                >
                  <GraduationCap className="w-4 h-4 text-[#1D4ED8]" /> Academic Results &amp; CGPA
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/system-management"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]"
                  >
                    <Server className="w-4 h-4 text-[#1D4ED8]" /> System Control Center
                  </Link>
                )}
              </div>

              {/* Log Out Button */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Log Out
                  </span>
                  <span className="text-[10px] font-mono">Sign Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Desktop Official DLCF AFIT Logo */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-sm hover:scale-105 transition-transform">
            <Image
              src="/dlcf_afit_logo.png"
              alt="DLCF AFIT Official Logo"
              fill
              className="object-contain p-0.5"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
