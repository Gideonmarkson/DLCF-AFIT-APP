export interface Devotional {
  id: string;
  date: string;
  topic: string;
  memoryVerse: string;
  bibleText: string;
  content: string;
  aiReflection?: string;
}

export interface StudyPlanRequest {
  courses: string[];
  targetCgpa: number;
  availableHoursPerWeek: number;
  focusAreas?: string;
}

export interface StudyPlanResponse {
  scheduleMarkdown: string;
  recommendedTechniques: string[];
  weeklyBreakdown: Array<{
    day: string;
    topics: string[];
    durationMinutes: number;
  }>;
}
