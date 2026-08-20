'use client';

import React from 'react';
import { DLCF_EXCO_PORTFOLIOS } from '@/lib/constants';

interface PortfolioMultiSelectProps {
  /** The person's primary office — excluded from the list, can't double as an "additional" one. */
  primaryOffice: string;
  selected: string[];
  onChange: (next: string[]) => void;
  className?: string;
}

// An Exco can hold more than one portfolio at once (e.g. General
// Coordinator who is also Asst Choir Master). This picks anything
// beyond the primary office selected elsewhere on the same form.
export function PortfolioMultiSelect({ primaryOffice, selected, onChange, className }: PortfolioMultiSelectProps) {
  const options = DLCF_EXCO_PORTFOLIOS.filter((office) => office !== primaryOffice);

  const toggle = (office: string) => {
    onChange(selected.includes(office) ? selected.filter((o) => o !== office) : [...selected, office]);
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-[#E2E8F0] p-2.5 ${className ?? ''}`}
    >
      {options.map((office) => (
        <label key={office} className="flex items-center gap-2 text-xs font-semibold text-[#1F2937] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selected.includes(office)}
            onChange={() => toggle(office)}
            className="rounded border-[#9CA3AF] text-[#1D4ED8] focus:ring-[#1D4ED8]"
          />
          {office}
        </label>
      ))}
    </div>
  );
}
