# SpeakSphere 🌐 (v2)

Multilingual speaking-practice app: React + TypeScript + Tailwind frontend, Node + Express + TypeScript backend, PostgreSQL.

## What changed in this version
| # | Change |
|---|--------|
| 1 | Language pages show **"8 languages are available"** |
| 2 | Learn gives words of the level you chose (Beginner / Medium / Hard – 24 words each, never mixed) |
| 3 | Translate dashboard + sidebar item **removed** |
| 4 | Login / Sign-up use the same blue background as the first page, with the SpeakSphere title and a big logo in the background |
| 5 | Every box and button uses a "crystal" glass style with layered shadows |
| 6 | Daily-conversation AI now replies like a normal chatbot (short, natural, no rigid sections) |
| 7 | Progress + Achievements use pie, donut and column charts |
| 8-9 | Source language and target language are **separate pages** with illustrations |
| 10 | Daily-conversation chat has a transparent robot as its background |
| 11 | First time you open Learn: **"Welcome to your first lesson!"** screen with an image |
| 12 | 12 word categories (Greetings, Fruits, Vegetables, Animals, Colors, Numbers, Family, Body Parts, Food & Drinks, Things, Emotions, Shapes) |
| 13 | Images, SVG illustrations and emoji everywhere |
| 14 | Speak page = **Word practice** + **Talk with AI** (voice) |
| 15 | New glass sidebar (bottom bar on phones) |
| 16 | **Daily quiz** – a new quiz every day, graded on the server |

Earlier edits kept: "Welcome <username> 👋" header, Learn shows source + target word, no heading on Speak, no badge on AI chat, no "learning journey" heading on Progress.

## Setup
1. Install Node 18+ and PostgreSQL. Create a **new, empty** database (the schema changed, so don't reuse the old one):
   `createdb speaksphere_v2`
2. Backend
   ```
   cd backend
   cp .env.example .env      # set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
   npm install
   npm run dev               # http://localhost:5000  (tables are created automatically)
   ```
3. Frontend (new terminal)
   ```
   cd frontend
   npm install
   npm run dev               # http://localhost:5173
   ```

## AI: real vs mock
* With `ANTHROPIC_API_KEY` set, chat, "translate this message" and word translation for any language pair use Claude (`ANTHROPIC_MODEL`, default `claude-sonnet-5-5`). The provider code is isolated in `backend/src/services/ai.ts`.
* Without a key the backend runs in **mock mode**: chat returns a few canned replies and the chat shows a small "Demo replies only" note. Nothing mock is presented as real AI.
* Built-in word data covers **Tamil, Hindi, Malayalam ↔ English**. Other pairs need the key – the missing words are translated once and cached in the `word_translations` table.
* API keys exist only in `backend/.env`.

## Notes
* Pronunciation score = how closely the browser's speech recognition text matches the word (use Chrome / Edge / Safari; allow the microphone).
* Study minutes are estimated from activity (20 s per word, 30 s per chat message, 2 min per quiz).
* Password reset: the link is printed in the backend console. For real email set `SMTP_*` and run `npm i nodemailer` in `backend`.
* Add more words in `backend/src/data/vocab.ts` (each category lists 2 beginner, 2 medium, 2 hard words).
* "Today" and streaks use `APP_TZ` (default in `.env.example`: Asia/Kolkata).

## Troubleshooting
* *Cannot reach the server* → backend isn't running on port 5000.
* *Database setup failed* → check `DATABASE_URL`, and that the database exists.
* *Mic does nothing* → use Chrome/Edge, allow microphone for localhost.
* *Some words hidden in Learn* → that language pair has no translation yet; add the API key.

## Structure
```
backend/  db/schema.sql  src/{index,config,db,mailer}.ts  src/routes/*  src/services/{ai,vocab,stats}.ts  src/data/{languages,vocab}.ts
frontend/ src/{App,auth,api,speech,toast}  src/components/{Layout,ChatPanel,LanguagePicker,Illustrations}  src/pages/*
```


## Requested project changes
- Language picker limited to English, Hindi, Japanese, German, French, Mandarin Chinese, Tamil and Telugu.
- Learning levels displayed as Beginner, Intermediate and Advanced while internal API values stay compatible.
- Speak with AI includes Food and Travel topics.
- Words marked learned are hidden from Learn for the rest of the day in the same browser.
- The initial landing page no longer shows the login prompt.


## Alphabet Bridge feature

The Learn page now has an **Alphabet & meanings** section alongside the existing word lessons. It shows a source letter, an approximate target-language sound/letter, sample words in both languages, an English meaning, search, and browser text-to-speech buttons. Curated sets are included for Tamil ↔ Hindi, English ↔ Hindi, Hindi ↔ English, and English ↔ Tamil. Letter correspondences are pronunciation guides and are not always exact one-to-one equivalents (particularly for Tamil sounds that Hindi does not have). Other language pairs continue to use the existing vocabulary lessons until a curated alphabet dataset is added.


## Update (notes 1-3, 5-7)
- Alphabet & meanings: target letter shows its own sound; all target letters are single letters; "Alphabet Bridge" box removed.
- Daily Chat / Speak with AI: AI replies include a "How to read it" spelling line.
- Login opens Learn with "Welcome, <username> 👋".
- Progress, words, XP, quizzes are tracked per language pair (`pair` column; auto-migrated on backend start).
