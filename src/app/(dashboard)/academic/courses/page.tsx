'use client';

import React from 'react';
import { CourseRegistrationForm } from '@/components/academic/CourseRegistrationForm';

export default function CourseRegistrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Course Schedule Registration</h1>
        <p className="text-xs text-slate-400">
          Select your registered courses for the current semester to automatically build your peer study network.
        </p>
      </div>

      <CourseRegistrationForm />
    </div>
  );
}
