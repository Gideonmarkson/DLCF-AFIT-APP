import { GradeLetter } from '@/types/database.types';

export const GRADE_POINTS: Record<GradeLetter, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export interface CourseGradeItem {
  creditUnits: number;
  grade: GradeLetter;
}

/**
 * Calculates Semester GPA from an array of course grade items
 */
export function calculateGPA(items: CourseGradeItem[]): number {
  if (!items || items.length === 0) return 0.0;

  let totalPoints = 0;
  let totalUnits = 0;

  for (const item of items) {
    const points = GRADE_POINTS[item.grade] ?? 0;
    totalPoints += points * item.creditUnits;
    totalUnits += item.creditUnits;
  }

  if (totalUnits === 0) return 0.0;

  const gpa = totalPoints / totalUnits;
  return Math.round(gpa * 100) / 100;
}

/**
 * Calculates updated CGPA combining previous CGPA and previous total units with current semester
 */
export function calculateCumulativeCGPA(
  previousCGPA: number,
  previousUnits: number,
  currentGPA: number,
  currentUnits: number
): { cgpa: number; isUnderperforming: boolean } {
  const previousPoints = previousCGPA * previousUnits;
  const currentPoints = currentGPA * currentUnits;
  const totalUnits = previousUnits + currentUnits;

  if (totalUnits === 0) {
    return { cgpa: currentGPA, isUnderperforming: currentGPA < 2.50 };
  }

  const cgpa = Math.round(((previousPoints + currentPoints) / totalUnits) * 100) / 100;
  return {
    cgpa,
    isUnderperforming: cgpa < 2.50,
  };
}

/**
 * Utility to format CGPA numbers nicely
 */
export function formatCGPA(val: number): string {
  return val.toFixed(2);
}
