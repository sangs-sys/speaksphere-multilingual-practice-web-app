import { Router } from 'express';
import { pool } from '../db';
import { h, HttpError, pairOf } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { CONCEPT_BY_ID } from '../data/vocab';
import { syncBadges } from '../services/stats';

export const activityRouter = Router();
activityRouter.use(requireAuth);

// kind: "word" (marked as learned) or "speak" (pronunciation attempt with score 0-100)
activityRouter.post('/', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  const kind = String(req.body.kind);
  const user = await loadUser(uid);
  if (!user.source_lang || !user.target_lang) throw new HttpError(400, 'Choose your languages first.');
  const pair = pairOf(user);
  if (kind === 'word') {
    const ref = String(req.body.ref || '');
    if (!CONCEPT_BY_ID.has(ref)) throw new HttpError(400, 'Unknown word.');
    const exists = await pool.query(`SELECT 1 FROM activity_log WHERE user_id=$1 AND kind='word' AND ref=$2 AND pair=$3`, [uid, ref, pair]);
    await pool.query(`INSERT INTO activity_log(user_id,kind,ref,xp,seconds,pair) VALUES ($1,'word',$2,$3,20,$4)`, [uid, ref, exists.rowCount ? 0 : 5, pair]);
  } else if (kind === 'speak') {
    const score = Math.max(0, Math.min(100, Math.round(Number(req.body.score) || 0)));
    const seconds = Math.max(5, Math.min(300, Math.round(Number(req.body.seconds) || 15)));
    await pool.query(`INSERT INTO activity_log(user_id,kind,ref,score,xp,seconds,pair) VALUES ($1,'speak',$2,$3,$4,$5,$6)`,
      [uid, String(req.body.ref || '').slice(0, 80), score, Math.max(1, Math.round(score / 10)), seconds, pair]);
  } else throw new HttpError(400, 'Unknown activity.');
  const b = await syncBadges(uid);
  res.json({ ok: true, newBadges: b.newly.map((x) => ({ emoji: x.emoji, title: x.title })) });
}));
