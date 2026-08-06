'use client';

import React, { createContext, useContext } from 'react';

export type RolePerspective =
  | 'GENERAL_STUDENT'
  | 'STUDENT_EXECUTIVE'
  | 'ASSOCIATE_COORDINATOR'
  | 'SYSTEM_ADMINISTRATOR';

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string | null;
  matricNumber: string | null;
  cgpa: number;
  currentLevel: string | null;
  department: string | null;
  executiveOffice: string | null;
  tenureSession: string | null;
  avatarUrl: string | null;
  fellowshipUnits: string[];
}

interface RoleContextType {
  userRole: RolePerspective;
  profile: UserProfile;
}

const defaultProfile: UserProfile = {
  fullName: 'User',
  email: '',
  phone: null,
  matricNumber: null,
  cgpa: 0,
  currentLevel: null,
  department: null,
  executiveOffice: null,
  tenureSession: null,
  avatarUrl: null,
  fellowshipUnits: [],
};

const RoleContext = createContext<RoleContextType>({ userRole: 'GENERAL_STUDENT', profile: defaultProfile });

export function RoleProvider({
  children,
  initialRole,
  profile,
}: {
  children: React.ReactNode;
  initialRole: RolePerspective;
  profile: UserProfile;
}) {
  return <RoleContext.Provider value={{ userRole: initialRole, profile }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
