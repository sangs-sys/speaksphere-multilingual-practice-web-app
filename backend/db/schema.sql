CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(40) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  source_lang VARCHAR(8),
  target_lang VARCHAR(8),
  level VARCHAR(10),
  first_lesson_seen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(12) NOT NULL,
  ref VARCHAR(80),
  score INT,
  xp INT NOT NULL DEFAULT 0,
  seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id, created_at);
CREATE TABLE IF NOT EXISTS badges (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(40) NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, code)
);
CREATE TABLE IF NOT EXISTS word_translations (
  concept_id VARCHAR(80) NOT NULL,
  lang VARCHAR(8) NOT NULL,
  text TEXT NOT NULL,
  roman TEXT,
  PRIMARY KEY (concept_id, lang)
);
CREATE TABLE IF NOT EXISTS quiz_results (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  PRIMARY KEY (user_id, day)
);

-- Per language-pair progress (source>target, e.g. "ta>en"). Each pair has its own words, XP, quizzes and charts.
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS pair VARCHAR(20);
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS pair VARCHAR(20);
UPDATE activity_log a SET pair = u.source_lang || '>' || u.target_lang
  FROM users u WHERE a.user_id = u.id AND a.pair IS NULL AND u.source_lang IS NOT NULL AND u.target_lang IS NOT NULL;
UPDATE quiz_results q SET pair = u.source_lang || '>' || u.target_lang
  FROM users u WHERE q.user_id = u.id AND q.pair IS NULL AND u.source_lang IS NOT NULL AND u.target_lang IS NOT NULL;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_pkey;
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_user_day_pair ON quiz_results(user_id, day, pair);
CREATE INDEX IF NOT EXISTS idx_activity_pair ON activity_log(user_id, pair);
