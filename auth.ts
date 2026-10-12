import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db';
import { config } from '../config';
import { h, HttpError } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { sendResetEmail } from '../mailer';

export const authRouter = Router();
const sign = (uid: number) => jwt.sign({ uid }, config.jwtSecret, { expiresIn: '30d' });
const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function publicUser(r: any) {
  return {
    id: r.id, username: r.username, email: r.email,
    sourceLang: r.source_lang, targetLang: r.target_lang, level: r.level,
    firstLessonSeen: r.first_lesson_seen,
  };
}

authRouter.post('/signup', h(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!/^[A-Za-z0-9_. -]{3,30}$/.test(username)) throw new HttpError(400, 'Username must be 3-30 letters, numbers or _ . -');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email.');
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
  try {
    const r = await pool.query(
      'INSERT INTO users(username,email,password_hash) VALUES ($1,$2,$3) RETURNING *',
      [username, email, await bcrypt.hash(password, 10)]);
    res.json({ token: sign(r.rows[0].id), user: publicUser(r.rows[0]) });
  } catch (e: any) {
    if (e.code === '23505') throw new HttpError(409, 'That username or email is already registered.');
    throw e;
  }
}));

authRouter.post('/login', h(async (req, res) => {
  const id = String(req.body.identifier || req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const r = await pool.query('SELECT * FROM users WHERE lower(email)=$1 OR lower(username)=$1', [id]);
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) throw new HttpError(401, 'Wrong email/username or password.');
  res.json({ token: sign(u.id), user: publicUser(u) });
}));

authRouter.get('/me', requireAuth, h(async (req, res) => {
  const u = await loadUser((req as AuthedRequest).uid);
  if (!u) throw new HttpError(401, 'Please log in again.');
  res.json({ user: publicUser(u) });
}));

authRouter.post('/forgot', h(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const r = await pool.query('SELECT id FROM users WHERE lower(email)=$1', [email]);
  if (r.rows[0]) {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO password_resets(user_id, token_hash, expires_at) VALUES ($1,$2, now() + interval '1 hour')`,
      [r.rows[0].id, sha(token)]);
    await sendResetEmail(email, `${config.frontendUrl}/reset?token=${token}`);
  }
  res.json({ message: 'If that email is registered, a reset link has been sent (in dev mode it is printed in the backend console).' });
}));

authRouter.post('/reset', h(async (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
  const r = await pool.query(
    'SELECT id, user_id FROM password_resets WHERE token_hash=$1 AND used=FALSE AND expires_at > now()', [sha(token)]);
  if (!r.rows[0]) throw new HttpError(400, 'This reset link is invalid or has expired.');
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(password, 10), r.rows[0].user_id]);
  await pool.query('UPDATE password_resets SET used=TRUE WHERE id=$1', [r.rows[0].id]);
  res.json({ message: 'Password updated. You can log in now.' });
}));
