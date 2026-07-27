'use client';

import React from 'react';
import { ResourceBank } from '@/components/fellowship/ResourceBank';
import { Folder } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Folder className="w-5 h-5 text-cyan-400" />
          Academic Past Questions & Fellowship Resource Repository
        </h1>
        <p className="text-xs text-slate-400">
          Categorized exam papers, tutorial question banks, devotionals, and unit guides for all AFIT levels.
        </p>
      </div>

      <ResourceBank />
    </div>
  );
}
