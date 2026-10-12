import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';

export interface AuthedRequest extends Request { uid: number }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { uid: number };
    (req as AuthedRequest).uid = payload.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again.' });
  }
}

export async function loadUser(uid: number) {
  const r = await pool.query('SELECT * FROM users WHERE id=$1', [uid]);
  return r.rows[0];
}
