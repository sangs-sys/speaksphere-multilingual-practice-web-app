import { Router } from 'express';
import { h, pairOf } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { CATEGORIES, CONCEPTS } from '../data/vocab';
import { getStats, syncBadges } from '../services/stats';

export const progressRouter = Router();
progressRouter.use(requireAuth);

progressRouter.get('/summary', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  const user = await loadUser(uid);
  const { list } = await syncBadges(uid); // badges are lifetime achievements across all language pairs
  // Everything else is for the CURRENT language pair only, so a new pair starts from zero.
  const s = await getStats(uid, user.level, pairOf(user));
  const lvl = s;

  const nextCat = CATEGORIES.map((c) => {
    const items = CONCEPTS.filter((x) => x.cat === c.id && x.level === user.level);
    return { id: c.id, name: c.name, emoji: c.emoji, remaining: items.filter((x) => !s.learnedIds.has(x.id)).length };
  }).find((c) => c.remaining > 0) || null;

  const earned = list.filter((b) => b.earned).sort((a, b) => String(b.earnedAt).localeCompare(String(a.earnedAt)));
  const nextBadge = list.filter((b) => !b.earned).sort((a, b) => b.value / b.goal - a.value / a.goal)[0] || null;

  res.json({
    xp: s.xp, streak: s.streak, words: s.words, speaks: s.speaks, speakAvg: s.speakAvg, chats: s.chats,
    quizzes: s.quizzes, quizAvg: s.quizAvg, quizToday: s.quizToday,
    goal: lvl.goal, nextLesson: nextCat, week: s.week, wordsByCategory: s.wordsByCategory,
    minutesWeek: Math.round(s.week.reduce((a, d) => a + d.minutes, 0)),
    mix: [
      { name: 'Words', value: s.words }, { name: 'Speaking', value: s.speaks },
      { name: 'Quizzes', value: s.quizzes }, { name: 'Chat', value: s.chats },
    ],
    skills: [
      { name: 'Vocabulary', value: lvl.goal.pct },
      { name: 'Speaking', value: s.speakAvg },
      { name: 'Quiz', value: s.quizAvg },
      { name: 'Conversation', value: Math.min(100, s.chats * 5) },
    ],
    latestBadge: earned[0] || null, nextBadge, badgeCount: earned.length, badgeTotal: list.length,
  });
}));

progressRouter.get('/achievements', h(async (req, res) => {
  const { list } = await syncBadges((req as AuthedRequest).uid);
  res.json({ badges: list });
}));
