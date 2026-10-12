import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/speaksphere_v2',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  tz: process.env.APP_TZ || 'UTC',
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
  aiProvider: (process.env.AI_PROVIDER || '').toLowerCase(),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'SpeakSphere <no-reply@speaksphere.local>',
  },
};
