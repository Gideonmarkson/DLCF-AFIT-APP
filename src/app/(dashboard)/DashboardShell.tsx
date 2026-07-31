'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { MobileNav } from '@/components/navigation/MobileNav';
import { RoleProvider, useRole, RolePerspective } from '@/context/RoleContext';

function Inner({ children, userName, userEmail, cgpa }: { children: React.ReactNode; userName: string; userEmail: string; cgpa: number }) {
  const { userRole } = useRole();
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans">
      <Sidebar userRole={userRole} userName={userName} cgpa={cgpa} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole={userRole} userName={userName} userEmail={userEmail} />
        <MobileNav userRole={userRole} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children, initialRole, userName, userEmail, cgpa }: { children: React.ReactNode; initialRole: RolePerspective; userName: string; userEmail: string; cgpa: number }) {
  return (
    <RoleProvider initialRole={initialRole}>
      <Inner userName={userName} userEmail={userEmail} cgpa={cgpa}>{children}</Inner>
    </RoleProvider>
  );
}