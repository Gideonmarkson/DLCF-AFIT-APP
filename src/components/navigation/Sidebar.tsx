'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  Calculator,
  Folder,
  Award,
  Video,
  Server,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RolePerspective } from '@/context/RoleContext';

interface SidebarProps {
  userRole?: RolePerspective;
  userName?: string;
  cgpa?: number;
  executiveOffice?: string | null;
}

export function Sidebar({
  userRole = 'GENERAL_STUDENT',
  userName = 'Brother Daniel Adebayo',
  cgpa = 4.25,
  executiveOffice = null,
}: SidebarProps) {
  const pathname = usePathname();

  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';
  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isCoordinator = isStaff || isExco;

  // Build navigation items strictly based on role:
  const navItems = [
    { href: '/dashboard', label: 'HOME DASHBOARD', icon: Home },
  ];

  // System Admin Center link placed prominently near the top for Administrators:
  if (isAdmin) {
    navItems.push({ href: '/admin/system-management', label: 'SYSTEM ADMIN CENTER', icon: Server });
  }

  // ACADEMIC EXCELLENCE (Included ONLY for student roles: GENERAL_STUDENT & STUDENT_EXECUTIVE)
  if (!isStaff && !isAdmin) {
    navItems.push(
      { href: '/academic/course-registration', label: 'COURSE REGISTRATION', icon: GraduationCap },
      { href: '/academic/peer-network', label: 'PEER MENTORSHIP NETWORK', icon: Users },
      { href: '/academic/results/upload', label: '  ↳ UPLOAD SEMESTER RESULTS', icon: Calculator },
      { href: '/academic/resources', label: '  ↳ PAST QUESTIONS HUB', icon: Folder },
      { href: '/academic/scholarships', label: '  ↳ SCHOLARSHIPS & GRANTS', icon: Award }
    );
  }

  navItems.push(
    { href: '/spiritual/counseling', label: 'CONFIDENTIAL COUNSELING', icon: HeartHandshake },
    { href: '/spiritual/devotionals', label: 'SPIRITUAL NURTURE', icon: BookOpen },
    { href: '/fellowship/forums', label: 'FELLOWSHIP HUB', icon: Users },
    { href: '/fellowship/media', label: 'MEDIA & RECORDINGS', icon: Video },
    { href: '/fellowship/excos', label: 'STUDENT EXCOS DIRECTORY', icon: UserCheck },
    { href: '/fellowship/coordinators', label: 'ASSOCIATE COORDINATORS', icon: ShieldCheck }
  );

  if (isCoordinator) {
    navItems.push({ href: '/admin/academic-overview', label: 'COORDINATOR GOVERNANCE', icon: Calendar });
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'SYSTEM ADMINISTRATOR';
    if (isStaff) return 'ASSOCIATE COORDINATOR';
    if (isExco) return 'STUDENT EXECUTIVE (EXCO)';
    return 'GENERAL STUDENT';
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-[#E2E8F0] bg-white h-screen sticky top-0 z-30 p-5 shadow-xs font-sans">
      
      {/* Brand Header with Official DLCF AFIT Logo */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0] mb-4 shrink-0">
        <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-sm shrink-0">
          <Image
            src="/dlcf_afit_logo.png"
            alt="DLCF AFIT Official Logo"
            fill
            className="object-contain p-0.5"
          />
        </div>
        <div className="whitespace-nowrap">
          <h1 className="text-base font-extrabold tracking-tight text-[#1F2937] leading-tight">
            DLCF AFIT
          </h1>
          <p className="text-[10px] font-extrabold text-[#1D4ED8]">Air Force Institute of Technology</p>
        </div>
      </div>

      {/* Navigation Menu Items with Smooth Vertical Scrollbar */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          const isSubItem = item.label.startsWith('  ↳');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center justify-between gap-2.5 rounded-xl transition-all duration-150 whitespace-nowrap group',
                isSubItem ? 'pl-6 pr-3 py-2 text-[11px] font-bold' : 'px-3.5 py-2.5 text-xs font-extrabold tracking-wide',
                isActive
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-2xs border border-[#1D4ED8]/20'
                  : 'text-[#4B5563] hover:text-[#1D4ED8] hover:bg-[#F8FAFC]'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                {isActive && !isSubItem && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1D4ED8] rounded-r-md" />
                )}
                <Icon className={cn(isSubItem ? 'w-3.5 h-3.5' : 'w-4 h-4 stroke-[2px] shrink-0', isActive ? 'text-[#1D4ED8]' : 'text-[#6B7280] group-hover:text-[#1D4ED8]')} />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </div>
              <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isActive ? 'text-[#1D4ED8]' : 'text-transparent group-hover:text-[#9CA3AF]')} />
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile & Role Section */}
      <div className="mt-auto pt-3 space-y-2.5 shrink-0 border-t border-[#E2E8F0]">
        {/* Role Banner */}
        <div className="relative bg-[#1D4ED8] text-white p-2.5 rounded-xl text-center shadow-md">
          <div className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Active Perspective:</div>
          <div className="text-xs font-extrabold tracking-wide whitespace-nowrap">{getRoleLabel()}</div>
        </div>

        {/* Profile Card */}
        <Link href="/profile/setup" className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3 hover:border-[#1D4ED8] transition-colors cursor-pointer block">
          <div className="w-9 h-9 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-xs shadow-sm ring-2 ring-[#1D4ED8]/20 shrink-0">
            {isAdmin ? 'SA' : isStaff ? 'SO' : isExco ? 'BA' : 'DA'}
          </div>
          <div className="truncate whitespace-nowrap flex-1">
            <div className="text-xs font-extrabold text-[#1F2937] truncate">{isAdmin ? 'Super Admin' : userName}</div>
            <div className="text-[10px] text-[#6B7280] font-semibold truncate">
              {isAdmin
                ? 'System Administrator'
                : isStaff
                  ? 'AFIT Associate Coordinator'
                  : isExco
                    ? executiveOffice || 'Student Executive'
                    : 'AFIT Student Member'}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
