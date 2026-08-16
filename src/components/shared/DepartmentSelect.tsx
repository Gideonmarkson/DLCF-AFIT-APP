'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AFIT_DEPARTMENTS } from '@/lib/constants';

const OTHER_DEPARTMENT_VALUE = '__OTHER__';

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Append " (DEGREE)" / " (ND)" / " (HND)" to each option label. */
  showCategory?: boolean;
  required?: boolean;
}

// A single source of truth for "pick your AFIT department" anywhere in the
// app. AFIT_DEPARTMENTS will never be complete — new programmes get added,
// and a hardcoded list will always eventually be missing one. Rather than
// patch the list every time someone reports a missing department, this
// always offers a manual "Other" fallback so a missing entry never blocks
// anyone from registering or updating their profile.
export function DepartmentSelect({ value, onChange, className, showCategory, required = true }: DepartmentSelectProps) {
  const isKnownDepartment = AFIT_DEPARTMENTS.some((d) => d.name === value);
  const [isOther, setIsOther] = useState(!isKnownDepartment && value !== '');
  const [customValue, setCustomValue] = useState(isKnownDepartment ? '' : value);

  // If the value gets reset externally (e.g. loading a saved profile) to a
  // known department, drop out of manual-entry mode to match it.
  useEffect(() => {
    if (AFIT_DEPARTMENTS.some((d) => d.name === value)) {
      setIsOther(false);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Select
        value={isOther ? OTHER_DEPARTMENT_VALUE : value}
        onChange={(e) => {
          if (e.target.value === OTHER_DEPARTMENT_VALUE) {
            setIsOther(true);
            onChange(customValue);
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
        className={className}
      >
        {AFIT_DEPARTMENTS.map((dept) => (
          <option key={dept.name} value={dept.name}>
            {showCategory ? `${dept.name} (${dept.category})` : dept.name}
          </option>
        ))}
        <option value={OTHER_DEPARTMENT_VALUE}>Other — type your department…</option>
      </Select>

      {isOther && (
        <Input
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={(e) => {
            const trimmed = e.target.value.trim();
            setCustomValue(trimmed);
            onChange(trimmed);
          }}
          placeholder="Type your department exactly as it should appear"
          className={className}
          required={required}
        />
      )}
    </div>
  );
}
