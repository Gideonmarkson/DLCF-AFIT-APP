'use client';

import React from 'react';
import { FellowshipNoticeFeed } from '@/components/fellowship/FellowshipNoticeFeed';
import { MessageSquare } from 'lucide-react';

export default function ForumsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Unit Notice Boards & Departmental Discussion Forums
        </h1>
        <p className="text-xs text-slate-400">
          Role-authenticated forums for Choir, Prayer, Academics, and Departmental units.
        </p>
      </div>

      <FellowshipNoticeFeed />
    </div>
  );
}
