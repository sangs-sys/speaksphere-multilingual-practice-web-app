import { Router } from 'express';
import { pool } from '../db';
import { h, HttpError, pairOf } from '../utils';
import { AuthedRequest, loadUser, requireAuth } from '../middleware/auth';
import { AiUnavailable, chat, translateText } from '../services/ai';
import { syncBadges } from '../services/stats';

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post('/chat', h(async (req, res) => {
  const uid = (req as AuthedRequest).uid;
  const user = await loadUser(uid);
  if (!user.source_lang || !user.target_lang) throw new HttpError(400, 'Choose your languages first.');
  const topic = String(req.body.topic || 'everyday life').slice(0, 60);
  const start = !!req.body.start;
  let messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  messages = messages.slice(-24).map((m: any) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 1000),
  }));
  if (start) messages = [{ role: 'user', content: 'Start a friendly, open-ended conversation. Greet me briefly and ask one simple question about any topic I would like to discuss. Do not assume a fixed topic.' }];
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new HttpError(400, 'Say something first.');

  let out;
  try {
    out = await chat({ messages, source: user.source_lang, target: user.target_lang, level: user.level || 'beginner', topic });
  } catch (e) {
    console.error('AI chat failed:', (e as Error).message);
    throw new HttpError(502, 'The AI tutor could not answer right now. Please try again.');
  }
  if (!start) {
    await pool.query(`INSERT INTO activity_log(user_id,kind,ref,xp,seconds,pair) VALUES ($1,'chat',$2,2,30,$3)`, [uid, topic, pairOf(user)]);
  }
  const b = await syncBadges(uid);
  res.json({ reply: out.reply, roman: out.roman, mock: out.mock, newBadges: b.newly.map((x) => ({ emoji: x.emoji, title: x.title })) });
}));

// Small "translate this message" helper used inside chat bubbles
aiRouter.post('/translate', h(async (req, res) => {
  const user = await loadUser((req as AuthedRequest).uid);
  const text = String(req.body.text || '').slice(0, 800);
  if (!text) throw new HttpError(400, 'Nothing to translate.');
  try {
    res.json({ translation: await translateText(text, user.target_lang, user.source_lang) });
  } catch (e) {
    if (e instanceof AiUnavailable) throw new HttpError(503, e.message);
    throw new HttpError(502, 'Translation failed. Please try again.');
  }
}));
