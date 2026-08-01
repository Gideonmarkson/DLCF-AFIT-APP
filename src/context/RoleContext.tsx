'use client';

import React, { createContext, useContext, useState } from 'react';

export type RolePerspective =
  | 'GENERAL_STUDENT'
  | 'STUDENT_EXECUTIVE'
  | 'ASSOCIATE_COORDINATOR'
  | 'SYSTEM_ADMINISTRATOR';

export interface UserProfile {
  fullName: string;
  email: string;
  cgpa: number;
  currentLevel: string | null;
  department: string | null;
  executiveOffice: string | null;
}

interface RoleContextType {
  userRole: RolePerspective;
  profile: UserProfile;
}

const defaultProfile: UserProfile = {
  fullName: 'User', email: '', cgpa: 0, currentLevel: null, department: null, executiveOffice: null,
};

const RoleContext = createContext<RoleContextType>({ userRole: 'GENERAL_STUDENT', profile: defaultProfile });

export function RoleProvider({ children, initialRole, profile }: { children: React.ReactNode; initialRole: RolePerspective; profile: UserProfile }) {
  const [userRole] = useState<RolePerspective>(initialRole);
  const [userProfile] = useState<UserProfile>(profile);
  return <RoleContext.Provider value={{ userRole, profile: userProfile }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}