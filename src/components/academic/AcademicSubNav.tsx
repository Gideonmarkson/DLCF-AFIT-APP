'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Users, Calculator, Folder, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/context/RoleContext';

export function AcademicSubNav() {
  const pathname = usePathname();
  const { userRole } = useRole();

  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';

  // Associate Coordinators do not have student registration, peer network, or CGPA upload tabs
  const allTabs = [
    { href: '/academic/course-registration', label: 'Course Registration', icon: GraduationCap, studentOnly: true },
    { href: '/academic/peer-network', label: 'Peer Mentorship Network', icon: Users, studentOnly: true },
    { href: '/academic/results/upload', label: 'Upload Semester Results & CGPA', icon: Calculator, studentOnly: true },
    { href: '/academic/resources', label: 'AFIT Past Questions Hub', icon: Folder, studentOnly: false },
    { href: '/academic/scholarships', label: 'Scholarships & Grants (Countdown)', icon: Award, studentOnly: false },
  ];

  const visibleTabs = isStaff ? allTabs.filter((tab) => !tab.studentOnly) : allTabs;

  if (visibleTabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 font-sans overflow-x-auto custom-scrollbar">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0',
              isActive
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1D4ED8] hover:bg-white/60'
            )}
          >
            <Icon className="w-4 h-4 stroke-[2px]" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
