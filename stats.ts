import { pool } from '../db';
import { config } from '../config';
import { CATEGORIES, CONCEPT_BY_ID, CONCEPTS } from '../data/vocab';

export async function todayStr(): Promise<string> {
  const r = await pool.query(`SELECT to_char((now() AT TIME ZONE $1)::date,'YYYY-MM-DD') d`, [config.tz]);
  return r.rows[0].d;
}

const shift = (day: string, delta: number) =>
  new Date(Date.parse(day + 'T00:00:00Z') + delta * 86400000).toISOString().slice(0, 10);

export interface BadgeDef {
  code: string; emoji: string; title: string; desc: string; goal: number;
  metric: 'words' | 'streak' | 'quizzes' | 'perfectQuizzes' | 'speaks' | 'chats' | 'xp';
}
export const BADGES: BadgeDef[] = [
  { code: 'first_word', emoji: '🌱', title: 'First Word', desc: 'Learn your first word', goal: 1, metric: 'words' },
  { code: 'words_25', emoji: '📗', title: 'Word Collector', desc: 'Learn 25 words', goal: 25, metric: 'words' },
  { code: 'words_60', emoji: '📚', title: 'Word Master', desc: 'Learn 60 words', goal: 60, metric: 'words' },
  { code: 'streak_3', emoji: '🔥', title: 'On Fire', desc: '3-day streak', goal: 3, metric: 'streak' },
  { code: 'streak_7', emoji: '🚀', title: 'Unstoppable', desc: '7-day streak', goal: 7, metric: 'streak' },
  { code: 'first_quiz', emoji: '🧠', title: 'Quiz Starter', desc: 'Finish a daily quiz', goal: 1, metric: 'quizzes' },
  { code: 'quiz_ace', emoji: '🏅', title: 'Quiz Ace', desc: 'Score 100% on a daily quiz', goal: 1, metric: 'perfectQuizzes' },
  { code: 'speaker_10', emoji: '🎤', title: 'Speaker', desc: 'Complete 10 speaking attempts', goal: 10, metric: 'speaks' },
  { code: 'chatter_20', emoji: '💬', title: 'Chatterbox', desc: 'Send 20 chat messages', goal: 20, metric: 'chats' },
  { code: 'xp_500', emoji: '🏆', title: 'Champion', desc: 'Earn 500 XP', goal: 500, metric: 'xp' },
];

// pair = "source>target" (e.g. "ta>en"). With a pair, XP / words / speaking / chat / quizzes / week chart
// count ONLY that language pair. Without a pair (used for badges) everything counts. The streak is always
// about study days overall.
export async function getStats(uid: number, level?: string | null, pair?: string) {
  const pa = pair ? [pair] : [];
  const t = await pool.query(
    `SELECT COALESCE(SUM(xp),0)::int xp,
            COUNT(*) FILTER (WHERE kind='speak')::int speaks,
            COALESCE(AVG(score) FILTER (WHERE kind='speak'),0)::int speak_avg,
            COUNT(*) FILTER (WHERE kind='chat')::int chats
       FROM activity_log WHERE user_id=$1${pair ? ' AND pair=$2' : ''}`, [uid, ...pa]);
  const wordsRes = await pool.query(`SELECT DISTINCT ref FROM activity_log WHERE user_id=$1 AND kind='word'${pair ? ' AND pair=$2' : ''}`, [uid, ...pa]);
  const learnedIds = new Set<string>(wordsRes.rows.map((r) => r.ref));

  const daysRes = await pool.query(
    `SELECT DISTINCT to_char((created_at AT TIME ZONE $2)::date,'YYYY-MM-DD') d FROM activity_log WHERE user_id=$1`,
    [uid, config.tz]);
  const days = new Set<string>(daysRes.rows.map((r) => r.d));
  const today = await todayStr();
  let streak = 0;
  let cur = days.has(today) ? today : shift(today, -1);
  while (days.has(cur)) { streak++; cur = shift(cur, -1); }

  const q = await pool.query(
    `SELECT COUNT(*)::int n, COALESCE(AVG(score*100.0/NULLIF(total,0)),0)::int avg,
            COUNT(*) FILTER (WHERE score=total)::int perfect FROM quiz_results WHERE user_id=$1${pair ? ' AND pair=$2' : ''}`, [uid, ...pa]);
  const qt = await pool.query(`SELECT score,total FROM quiz_results WHERE user_id=$1 AND day=$2${pair ? ' AND pair=$3' : ''}`, [uid, today, ...pa]);

  const week: { day: string; label: string; minutes: number; words: number }[] = [];
  const wk = await pool.query(
    `SELECT to_char((created_at AT TIME ZONE $2)::date,'YYYY-MM-DD') d, COALESCE(SUM(seconds),0)::int sec,
            COUNT(*) FILTER (WHERE kind='word')::int words
       FROM activity_log WHERE user_id=$1 AND created_at > now() - interval '9 days'${pair ? ' AND pair=$3' : ''} GROUP BY d`, [uid, config.tz, ...pa]);
  const byDay = new Map(wk.rows.map((r) => [r.d, r]));
  for (let i = 6; i >= 0; i--) {
    const d = shift(today, -i);
    const row: any = byDay.get(d);
    week.push({
      day: d,
      label: new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      minutes: row ? Math.round((row.sec / 60) * 10) / 10 : 0,
      words: row ? row.words : 0,
    });
  }

  const levelConcepts = CONCEPTS.filter((c) => !level || c.level === level);
  const learnedAtLevel = levelConcepts.filter((c) => learnedIds.has(c.id)).length;

  const byCat = CATEGORIES.map((c) => ({
    name: c.name, emoji: c.emoji,
    value: [...learnedIds].filter((id) => CONCEPT_BY_ID.get(id)?.cat === c.id).length,
  })).filter((c) => c.value > 0);

  return {
    xp: t.rows[0].xp as number, speaks: t.rows[0].speaks as number, speakAvg: t.rows[0].speak_avg as number,
    chats: t.rows[0].chats as number, words: learnedIds.size, learnedIds, streak,
    quizzes: q.rows[0].n as number, quizAvg: q.rows[0].avg as number, perfectQuizzes: q.rows[0].perfect as number,
    quizToday: qt.rows[0] ? { done: true, score: qt.rows[0].score, total: qt.rows[0].total } : { done: false },
    week, goal: { learned: learnedAtLevel, total: levelConcepts.length, pct: levelConcepts.length ? Math.round((learnedAtLevel / levelConcepts.length) * 100) : 0 },
    wordsByCategory: byCat,
  };
}

export async function syncBadges(uid: number) {
  const s = await getStats(uid);
  const val = (m: BadgeDef['metric']) => (s as any)[m] as number;
  const newly: BadgeDef[] = [];
  for (const b of BADGES) {
    if (val(b.metric) >= b.goal) {
      const r = await pool.query(
        'INSERT INTO badges(user_id, code) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING code', [uid, b.code]);
      if (r.rowCount) newly.push(b);
    }
  }
  const earned = await pool.query('SELECT code, earned_at FROM badges WHERE user_id=$1', [uid]);
  const at = new Map(earned.rows.map((r) => [r.code, r.earned_at as Date]));
  const list = BADGES.map((b) => ({
    code: b.code, emoji: b.emoji, title: b.title, desc: b.desc, goal: b.goal,
    value: Math.min(val(b.metric), b.goal), earned: at.has(b.code),
    earnedAt: at.get(b.code)?.toISOString() || null,
  }));
  return { list, newly, stats: s };
}
