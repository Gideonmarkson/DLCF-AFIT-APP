'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { MobileNav } from '@/components/navigation/MobileNav';
import { RoleProvider, useRole, RolePerspective, UserProfile } from '@/context/RoleContext';

function Inner({ children }: { children: React.ReactNode }) {
  const { userRole, profile } = useRole();
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans">
      <Sidebar userRole={userRole} userName={profile.fullName} cgpa={profile.cgpa} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole={userRole} userName={profile.fullName} userEmail={profile.email} />
        <MobileNav userRole={userRole} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children, initialRole, profile }: { children: React.ReactNode; initialRole: RolePerspective; profile: UserProfile }) {
  return (
    <RoleProvider initialRole={initialRole} profile={profile}>
      <Inner>{children}</Inner>
    </RoleProvider>
  );
}
