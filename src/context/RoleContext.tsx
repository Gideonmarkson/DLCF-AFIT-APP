'use client';

import React, { createContext, useContext, useState } from 'react';

export type RolePerspective =
  | 'GENERAL_STUDENT'
  | 'STUDENT_EXECUTIVE'
  | 'ASSOCIATE_COORDINATOR'
  | 'SYSTEM_ADMINISTRATOR';

interface RoleContextType {
  userRole: RolePerspective;
  setUserRole: (role: RolePerspective) => void;
}

const RoleContext = createContext<RoleContextType>({
  userRole: 'GENERAL_STUDENT',
  setUserRole: () => {},
});

export function RoleProvider({
  children,
  initialRole,
}: {
  children: React.ReactNode;
  initialRole: RolePerspective;
}) {
  const [userRole, setUserRole] = useState<RolePerspective>(initialRole);
  return <RoleContext.Provider value={{ userRole, setUserRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}