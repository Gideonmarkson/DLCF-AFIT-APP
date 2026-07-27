'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AcademicNetworkRedirectPage() {
  useEffect(() => {
    redirect('/academic/course-registration');
  }, []);

  return null;
}
