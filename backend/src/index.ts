import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { migrate } from './db';
import { HttpError } from './utils';
import { LANGUAGES } from './data/languages';
import { aiEnabled } from './services/ai';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { vocabRouter } from './routes/vocab';
import { activityRouter } from './routes/activity';
import { quizRouter } from './routes/quiz';
import { aiRouter } from './routes/ai';
import { progressRouter } from './routes/progress';

const app = express();
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: aiEnabled ? 'anthropic' : 'mock' }));
app.get('/api/languages', (_req, res) => res.json({ languages: LANGUAGES }));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/activity', activityRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/ai', aiRouter);
app.use('/api/progress', progressRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

migrate()
  .then(() => app.listen(config.port, () => {
    console.log(`✅ SpeakSphere API on http://localhost:${config.port}`);
    console.log(aiEnabled ? `🤖 AI: Anthropic (${config.model})` : '🧪 AI: MOCK mode (set ANTHROPIC_API_KEY for real AI)');
  }))
  .catch((e) => { console.error('Database setup failed:', e.message); process.exit(1); });
