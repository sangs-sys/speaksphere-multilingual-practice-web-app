import { Router } from 'express';
import { pool } from '../db';
import { h, HttpError, pairOf } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { CONCEPTS } from '../data/vocab';
import { langName } from '../data/languages';
import { resolveWords } from '../services/vocab';
import { syncBadges, todayStr } from '../services/stats';

export const quizRouter = Router();
quizRouter.use(requireAuth);

function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => { let t = (a += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(arr: T[], rnd: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Same user + same day => same quiz, so answers can be graded without storing state
async function build(user: any, day: string) {
  const rnd = seeded(`${user.id}|${day}|${user.source_lang}|${user.target_lang}|${user.level}`);
  const concepts = CONCEPTS.filter((c) => c.level === user.level);
  const words = (await resolveWords(concepts, user.source_lang, user.target_lang)).filter((w) => w.source && w.target);
  if (words.length < 4) return null;
  const picked = shuffle(words, rnd).slice(0, 8);
  const srcName = langName(user.source_lang), tgtName = langName(user.target_lang);
  return picked.map((w, i) => {
    const toTarget = i % 2 === 0;
    const correct = (toTarget ? w.target! : w.source!).text;
    const pool = [...new Set(words.filter((x) => x.id !== w.id).map((x) => (toTarget ? x.target! : x.source!).text))]
      .filter((t) => t !== correct);
    const options = shuffle([correct, ...shuffle(pool, rnd).slice(0, 3)], rnd);
    return {
      id: w.id, emoji: w.emoji, correct, options,
      prompt: toTarget
        ? `How do you say “${w.source!.text}” in ${tgtName}?`
        : `What does “${w.target!.text}” mean in ${srcName}?`,
    };
  });
}

quizRouter.get('/daily', h(async (req, res) => {
  const user = await loadUser((req as AuthedRequest).uid);
  const day = await todayStr();
  const done = await pool.query('SELECT score,total FROM quiz_results WHERE user_id=$1 AND day=$2 AND pair=$3', [user.id, day, pairOf(user)]);
  if (done.rows[0]) return res.json({ completed: true, score: done.rows[0].score, total: done.rows[0].total, questions: [] });
  const qs = await build(user, day);
  if (!qs) throw new HttpError(422, 'Not enough words are available for this language pair yet. Add ANTHROPIC_API_KEY to translate more words.');
  res.json({ completed: false, questions: qs.map(({ correct, ...q }) => q) });
}));

quizRouter.post('/submit', h(async (req, res) => {
  const user = await loadUser((req as AuthedRequest).uid);
  const day = await todayStr();
  const done = await pool.query('SELECT 1 FROM quiz_results WHERE user_id=$1 AND day=$2 AND pair=$3', [user.id, day, pairOf(user)]);
  if (done.rowCount) throw new HttpError(409, 'You already finished today’s quiz. Come back tomorrow!');
  const qs = await build(user, day);
  if (!qs) throw new HttpError(422, 'Quiz unavailable.');
  const answers: Record<string, string> = req.body.answers || {};
  const results = qs.map((q) => ({ id: q.id, emoji: q.emoji, prompt: q.prompt, correct: q.correct, yours: answers[q.id] ?? null, right: answers[q.id] === q.correct }));
  const score = results.filter((r) => r.right).length;
  await pool.query('INSERT INTO quiz_results(user_id, day, score, total, pair) VALUES ($1,$2,$3,$4,$5)', [user.id, day, score, qs.length, pairOf(user)]);
  await pool.query(`INSERT INTO activity_log(user_id,kind,ref,score,xp,seconds,pair) VALUES ($1,'quiz',$2,$3,$4,120,$5)`,
    [user.id, day, Math.round((score / qs.length) * 100), score * 10, pairOf(user)]);
  const b = await syncBadges(user.id);
  res.json({ score, total: qs.length, xp: score * 10, results, newBadges: b.newly.map((x) => ({ emoji: x.emoji, title: x.title })) });
}));
