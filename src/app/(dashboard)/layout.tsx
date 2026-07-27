'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { MobileNav } from '@/components/navigation/MobileNav';
import { RoleProvider, useRole } from '@/context/RoleContext';

function DashboardInnerLayout({ children }: { children: React.ReactNode }) {
  const { userRole, setUserRole } = useRole();

  const getUserDetails = () => {
    switch (userRole) {
      case 'SYSTEM_ADMINISTRATOR':
        return {
          userName: 'Super Admin',
          cgpa: 0,
        };
      case 'STUDENT_EXECUTIVE':
        return {
          userName: 'Sister Blessing Adeyemi (Academic Dir)',
          cgpa: 4.75,
        };
      case 'ASSOCIATE_COORDINATOR':
        return {
          userName: 'Pastor / Bro. Samuel Okosun',
          cgpa: 0,
        };
      case 'GENERAL_STUDENT':
      default:
        return {
          userName: 'Brother Daniel Adebayo (300L)',
          cgpa: 4.25,
        };
    }
  };

  const { userName, cgpa } = getUserDetails();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans">
      <Sidebar userRole={userRole} userName={userName} cgpa={cgpa} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole={userRole} onRoleChange={(role) => setUserRole(role)} />
        <MobileNav userRole={userRole} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <DashboardInnerLayout>{children}</DashboardInnerLayout>
    </RoleProvider>
  );
}
