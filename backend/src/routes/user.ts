import { Router } from 'express';
import { pool } from '../db';
import { h, HttpError } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { isLang } from '../data/languages';
import { isLevel } from '../data/vocab';
import { publicUser } from './auth';

export const userRouter = Router();
userRouter.use(requireAuth);

userRouter.put('/prefs', h(async (req, res) => {
  const { sourceLang, targetLang, level } = req.body;
  if (!isLang(sourceLang) || !isLang(targetLang)) throw new HttpError(400, 'Choose valid languages.');
  if (sourceLang === targetLang) throw new HttpError(400, 'Source and target language must be different.');
  if (!isLevel(level)) throw new HttpError(400, 'Choose beginner, medium or hard.');
  const uid = (req as AuthedRequest).uid;
  await pool.query('UPDATE users SET source_lang=$1, target_lang=$2, level=$3 WHERE id=$4', [sourceLang, targetLang, level, uid]);
  res.json({ user: publicUser(await loadUser(uid)) });
}));

userRouter.post('/first-lesson-seen', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  await pool.query('UPDATE users SET first_lesson_seen=TRUE WHERE id=$1', [uid]);
  res.json({ user: publicUser(await loadUser(uid)) });
}));
