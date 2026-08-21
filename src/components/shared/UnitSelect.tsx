'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FELLOWSHIP_UNITS } from '@/lib/constants';

const OTHER_UNIT_VALUE = '__OTHER__';
const GENERAL_UNIT_VALUE = 'NONE';

interface UnitSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Show a "General / All Units" broadcast option at the top. Default true. */
  includeGeneral?: boolean;
  /** Prefix shown before each option label, e.g. "Unit: ". Default none. */
  labelPrefix?: string;
}

// forum_posts.target_unit used to be locked to a small, stale Postgres
// enum (CHOIR/PRAYER/USHERING/ACADEMICS/PUBLICITY/EVANGELISM/TECHNICAL/
// SANCTUARY/NONE) that never matched FELLOWSHIP_UNITS, the real unit
// list used everywhere else in the app (missing Media, Maintenance,
// Drama, Organising, Follow-Up, Sister Welfare; included two units,
// Technical and Sanctuary, that aren't part of the real taxonomy).
// The column is now plain text, so this always offers the real,
// current unit list plus a manual "Other" fallback — same pattern as
// DepartmentSelect — so a missing/new unit never needs a code deploy.
export function UnitSelect({ value, onChange, className, includeGeneral = true, labelPrefix = '' }: UnitSelectProps) {
  const isKnown = value === GENERAL_UNIT_VALUE || FELLOWSHIP_UNITS.includes(value);
  const [isOther, setIsOther] = useState(!isKnown && value !== '');
  const [customValue, setCustomValue] = useState(isKnown ? '' : value);

  useEffect(() => {
    if (value === GENERAL_UNIT_VALUE || FELLOWSHIP_UNITS.includes(value)) {
      setIsOther(false);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Select
        value={isOther ? OTHER_UNIT_VALUE : value}
        onChange={(e) => {
          if (e.target.value === OTHER_UNIT_VALUE) {
            setIsOther(true);
            onChange(customValue);
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
        className={className}
      >
        {includeGeneral && <option value={GENERAL_UNIT_VALUE}>{labelPrefix}General / All Units</option>}
        {FELLOWSHIP_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {labelPrefix}{unit}
          </option>
        ))}
        <option value={OTHER_UNIT_VALUE}>{labelPrefix}Other — type a unit…</option>
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
          placeholder="Type the unit name"
          className={className}
        />
      )}
    </div>
  );
}
