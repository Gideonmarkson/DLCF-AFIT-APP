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

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<RolePerspective>('GENERAL_STUDENT');

  return (
    <RoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
