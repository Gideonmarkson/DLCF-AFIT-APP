'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Menu,
  X,
  Users,
  Video,
  UserCheck,
  ShieldCheck,
  Calculator,
  Folder,
  Award,
  Server,
  Calendar,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RolePerspective, useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';

export function MobileNav({ userRole = 'GENERAL_STUDENT' }: { userRole?: RolePerspective }) {
  const pathname = usePathname();
  const { setUserRole } = useRole();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';
  const isCoordinator = isStaff || isExco;

  // Primary Top Navigation Tabs for Mobile
  const primaryTabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  ];

  if (!isStaff && !isAdmin) {
    primaryTabs.push({ href: '/academic/course-registration', label: 'Academic', icon: GraduationCap });
  }

  primaryTabs.push(
    { href: '/spiritual/devotionals', label: 'Devotional', icon: BookOpen },
    { href: '/spiritual/counseling', label: 'Counseling', icon: HeartHandshake }
  );

  return (
    <>
      {/* ================= 1. STICKY TOP NAVIGATION BAR FOR MOBILE ================= */}
      <nav className="lg:hidden sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-2 py-1.5 shadow-xs flex items-center justify-around font-sans">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-[#1D4ED8] font-extrabold bg-[#EFF6FF]'
                  : 'text-[#6B7280] font-bold hover:text-[#1F2937]'
              )}
            >
              <Icon className={cn('w-4 h-4 stroke-[2px]', isActive ? 'text-[#1D4ED8]' : 'text-[#6B7280]')} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5th Tab: Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 text-[#6B7280] font-bold hover:text-[#1F2937]',
            isDrawerOpen && 'text-[#1D4ED8] bg-[#EFF6FF]'
          )}
        >
          <Menu className="w-4 h-4 stroke-[2px]" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* ================= 2. MOBILE NAVIGATION DRAWER ================= */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-start bg-black/60 backdrop-blur-xs font-sans animate-fadeIn pt-16 sm:pt-20">
          
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />

          {/* Drawer Sheet Content Container */}
          <div className="bg-white rounded-b-3xl border-b border-[#E2E8F0] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border border-[#1E3A8A] shadow-xs">
                  <Image src="/dlcf_afit_logo.png" alt="DLCF AFIT Logo" fill className="object-contain p-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1F2937]">DLCF AFIT Navigation</h3>
                  <p className="text-[10px] font-extrabold text-[#1D4ED8]">Saintly Intellectuals Hub</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Role Switcher Bar */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider">
                Switch Perspective (Mobile Test):
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs">
                <button
                  onClick={() => setUserRole('GENERAL_STUDENT')}
                  className={cn(
                    'py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all text-center',
                    userRole === 'GENERAL_STUDENT' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280]'
                  )}
                >
                  Student
                </button>
                <button
                  onClick={() => setUserRole('STUDENT_EXECUTIVE')}
                  className={cn(
                    'py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all text-center',
                    userRole === 'STUDENT_EXECUTIVE' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280]'
                  )}
                >
                  Exco Leader
                </button>
                <button
                  onClick={() => setUserRole('ASSOCIATE_COORDINATOR')}
                  className={cn(
                    'py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all text-center',
                    userRole === 'ASSOCIATE_COORDINATOR' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280]'
                  )}
                >
                  Coordinator
                </button>
                <button
                  onClick={() => setUserRole('SYSTEM_ADMINISTRATOR')}
                  className={cn(
                    'py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all text-center',
                    userRole === 'SYSTEM_ADMINISTRATOR' ? 'bg-[#1D4ED8] text-white shadow-xs' : 'text-[#6B7280]'
                  )}
                >
                  System Admin
                </button>
              </div>
            </div>

            {/* Comprehensive Mobile Navigation List */}
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider px-1 pb-1">
                Explore Portal Services:
              </div>

              {/* System Admin Link Placed Prominently at Top for System Admins */}
              {isAdmin && (
                <Link
                  href="/admin/system-management"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/30 text-xs font-extrabold text-[#1D4ED8]"
                >
                  <span className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-[#1D4ED8]" /> System Admin Control Center
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#1D4ED8]" />
                </Link>
              )}

              {!isStaff && !isAdmin && (
                <>
                  <Link
                    href="/academic/course-registration"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
                  >
                    <span className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#1D4ED8]" /> Course Registration
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </Link>

                  <Link
                    href="/academic/peer-network"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#1D4ED8]" /> Peer Mentorship Network
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </Link>

                  <Link
                    href="/academic/results/upload"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Calculator className="w-4 h-4 text-[#1D4ED8]" /> Upload Semester Results &amp; CGPA
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </Link>

                  <Link
                    href="/academic/resources"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-[#1D4ED8]" /> Past Questions Repository
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </Link>

                  <Link
                    href="/academic/scholarships"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-[#D97706]" /> Scholarships &amp; Grants
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </Link>
                </>
              )}

              <Link
                href="/fellowship/forums"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#1D4ED8]" /> Fellowship Hub &amp; Forums
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </Link>

              <Link
                href="/fellowship/media"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
              >
                <span className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-[#1D4ED8]" /> Media &amp; Service Recordings
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </Link>

              <Link
                href="/fellowship/excos"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#1D4ED8]" /> Student Excos Directory
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </Link>

              <Link
                href="/fellowship/coordinators"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-extrabold text-[#1F2937]"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" /> Associate Coordinators
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </Link>

              {isCoordinator && (
                <Link
                  href="/admin/academic-overview"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs font-extrabold text-[#1D4ED8]"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#1D4ED8]" /> Coordinator Governance Queue
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#1D4ED8]" />
                </Link>
              )}
            </div>

            {/* Logout / Sign In Redirect */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <Link href="/login" onClick={() => setIsDrawerOpen(false)}>
                <Button variant="outline" className="w-full text-xs font-bold gap-2 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50">
                  <LogOut className="w-4 h-4" /> Sign Out of Account
                </Button>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
