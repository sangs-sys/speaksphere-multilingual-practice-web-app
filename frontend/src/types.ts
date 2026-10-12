export type Level = 'beginner' | 'medium' | 'hard';
export interface User {
  id: number; username: string; email: string;
  sourceLang: string | null; targetLang: string | null; level: Level | null; firstLessonSeen: boolean;
}
export interface Lang { code: string; name: string; native: string; flag: string; speech: string }
export interface Side { text: string; roman?: string | null }
export interface Word { id: string; cat: string; level: Level; emoji: string; source: Side; target: Side; learned: boolean }
export interface Category { id: string; name: string; emoji: string; total: number; learned: number }
export interface BadgeInfo {
  code: string; emoji: string; title: string; desc: string; goal: number; value: number; earned: boolean; earnedAt: string | null;
}
export interface Summary {
  xp: number; streak: number; words: number; speaks: number; speakAvg: number; chats: number; quizzes: number; quizAvg: number;
  quizToday: { done: boolean; score?: number; total?: number };
  goal: { learned: number; total: number; pct: number };
  nextLesson: { id: string; name: string; emoji: string; remaining: number } | null;
  week: { day: string; label: string; minutes: number; words: number }[];
  wordsByCategory: { name: string; emoji: string; value: number }[];
  mix: { name: string; value: number }[];
  skills: { name: string; value: number }[];
  minutesWeek: number;
  latestBadge: BadgeInfo | null; nextBadge: BadgeInfo | null; badgeCount: number; badgeTotal: number;
}
export const LEVEL_INFO: Record<Level, { label: string; emoji: string; desc: string }> = {
  beginner: { label: 'Beginner', emoji: '🌱', desc: 'Basic everyday words' },
  medium: { label: 'Intermediate', emoji: '🌿', desc: 'Build sentences and practise everyday conversations' },
  hard: { label: 'Advanced', emoji: '🌳', desc: 'Longer sentences, grammar and detailed conversations' },
};
