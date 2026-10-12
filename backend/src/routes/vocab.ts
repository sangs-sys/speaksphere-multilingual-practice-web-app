import { Router } from 'express';
import { pool } from '../db';
import { h, HttpError, pairOf } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { CATEGORIES, CONCEPTS, isLevel } from '../data/vocab';
import { resolveWords } from '../services/vocab';

export const vocabRouter = Router();
vocabRouter.use(requireAuth);

async function learnedSet(uid: number, pair: string) {
  const r = await pool.query(`SELECT DISTINCT ref FROM activity_log WHERE user_id=$1 AND kind='word' AND pair=$2`, [uid, pair]);
  return new Set<string>(r.rows.map((x) => x.ref));
}

// Categories with how many words exist/learned at the chosen level
vocabRouter.get('/categories', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  const u = await loadUser(uid);
  const level = isLevel(req.query.level) ? req.query.level : u.level || 'beginner';
  const learned = await learnedSet(uid, pairOf(u));
  res.json({
    level,
    categories: CATEGORIES.map((c) => {
      const items = CONCEPTS.filter((x) => x.cat === c.id && x.level === level);
      return { ...c, total: items.length, learned: items.filter((x) => learned.has(x.id)).length };
    }),
  });
}));

// Words of ONE level (beginner / medium / hard) for the user's language pair
vocabRouter.get('/words', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  const u = await loadUser(uid);
  if (!u.source_lang || !u.target_lang) throw new HttpError(400, 'Choose your languages first.');
  const level = isLevel(req.query.level) ? req.query.level : u.level || 'beginner';
  const cat = String(req.query.category || '');
  const concepts = CONCEPTS.filter((c) => c.level === level && (!cat || c.cat === cat));
  const learned = await learnedSet(uid, pairOf(u));
  const all = await resolveWords(concepts, u.source_lang, u.target_lang);
  const words = all.filter((w) => w.source && w.target).map((w) => ({ ...w, learned: learned.has(w.id) }));
  res.json({ level, words, missing: all.length - words.length });
}));
