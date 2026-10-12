import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { WelcomeHero } from '../components/Illustrations';
import AlphabetLearning from '../components/AlphabetLearning';
import { speak } from '../speech';
import { useToast } from '../toast';
import { Category, Level, LEVEL_INFO, Word } from '../types';

function WelcomeLesson({ onGo }: { onGo: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center crystal p-6 mt-6 animate-pop">
      <WelcomeHero className="w-full max-w-xs mx-auto" />
      <h1 className="text-3xl font-bold mt-2">Welcome to your first lesson! 🎉</h1>
      <p className="text-slate-600 mt-1">Let's start studying!</p>
      <button className="crystal-btn w-full mt-5" onClick={onGo}>Let's Go! 🚀</button>
    </div>
  );
}

export default function Learn() {
  const { user, lang, refresh } = useAuth();
  const { badges } = useToast();
  const [params, setParams] = useSearchParams();
  const [level, setLevel] = useState<Level>(user!.level!);
  const [cats, setCats] = useState<Category[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [missing, setMissing] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [section, setSection] = useState<'words' | 'alphabet'>('words');
  const dayKey = `speaksphere-learned-${user?.sourceLang || 'none'}-${user?.targetLang || 'none'}-${new Date().toLocaleDateString('en-CA')}`;
  const [learnedToday, setLearnedToday] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(dayKey) || '[]'); } catch { return []; } });
  const cat = params.get('cat');
  const src = lang(user?.sourceLang), tgt = lang(user?.targetLang);

  const loadCats = useCallback(() => api<{ categories: Category[] }>(`/vocab/categories?level=${level}`).then((r) => setCats(r.categories)).catch((e) => setErr(e.message)), [level]);
  useEffect(() => { if (user?.firstLessonSeen) loadCats(); }, [loadCats, user?.firstLessonSeen]);
  useEffect(() => {
    if (!cat || !user?.firstLessonSeen) { setWords([]); return; }
    setLoading(true); setErr('');
    api<{ words: Word[]; missing: number }>(`/vocab/words?level=${level}&category=${cat}`)
      .then((r) => { setWords(r.words); setMissing(r.missing); })
      .catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [cat, level, user?.firstLessonSeen]);

  if (!user?.firstLessonSeen) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Welcome, {user?.username} 👋</h1>
        <WelcomeLesson onGo={async () => { await api('/user/first-lesson-seen', { method: 'POST' }); await refresh(); }} />
      </div>
    );
  }

  async function learned(w: Word) {
    try {
      const r = await api<{ newBadges: { emoji: string; title: string }[] }>('/activity', { body: { kind: 'word', ref: w.id } });
      setWords((x) => x.map((i) => (i.id === w.id ? { ...i, learned: true } : i)));
      setLearnedToday((previous) => {
        const next = previous.includes(w.id) ? previous : [...previous, w.id];
        localStorage.setItem(dayKey, JSON.stringify(next));
        return next;
      });
      badges(r.newBadges); loadCats();
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Failed.'); }
  }
  const current = cats.find((c) => c.id === cat);
  const visibleWords = words.filter((w) => !learnedToday.includes(w.id));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Welcome, {user?.username} 👋</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(Object.keys(LEVEL_INFO) as Level[]).map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`crystal-btn crystal-btn-sm ${level === l ? '' : 'crystal-btn-light'}`}>{LEVEL_INFO[l].emoji} {LEVEL_INFO[l].label}</button>
          ))}
        </div>
        <span className="crystal px-4 py-1.5 text-sm font-medium">{src?.flag} {src?.name} ➜ {tgt?.flag} {tgt?.name}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className={`crystal-btn ${section === 'words' ? '' : 'crystal-btn-light'}`} onClick={() => setSection('words')}>📚 Word lessons</button>
        <button className={`crystal-btn ${section === 'alphabet' ? '' : 'crystal-btn-light'}`} onClick={() => setSection('alphabet')}>🔤 Alphabet & meanings</button>
      </div>
      {err && <p className="mt-3 text-red-600">{err}</p>}

      {section === 'alphabet' ? <AlphabetLearning /> : (!cat ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map((c, i) => (
            <button key={c.id} onClick={() => setParams({ cat: c.id })} style={{ animationDelay: `${i * 45}ms` }}
              className="crystal crystal-hover animate-rise p-5 text-center">
              <div className="text-5xl">{c.emoji}</div>
              <div className="font-semibold mt-2">{c.name}</div>
              <div className="text-xs text-slate-500">{c.learned}/{c.total} learned</div>
              <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${c.total ? (c.learned / c.total) * 100 : 0}%` }} /></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <button className="crystal-btn crystal-btn-light crystal-btn-sm" onClick={() => setParams({})}>← All categories</button>
          <h2 className="text-2xl font-bold mt-3">{current?.emoji} {current?.name} <span className="text-base font-medium text-slate-500">· {LEVEL_INFO[level].label} words</span></h2>
          {loading && <p className="mt-4 animate-pulse">Loading words…</p>}
          {missing > 0 && <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">{missing} word(s) are hidden because this language pair has no translation yet. Add ANTHROPIC_API_KEY in backend/.env to translate them automatically.</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWords.map((w, i) => (
              <div key={w.id} style={{ animationDelay: `${i * 60}ms` }} className="crystal crystal-hover animate-rise p-5">
                <div className="flex items-start justify-between">
                  <span className="text-5xl">{w.emoji}</span>
                  {w.learned && <span className="text-emerald-600 text-sm font-semibold">✔ Learned</span>}
                </div>
                <div className="mt-3 text-xs text-slate-500">{src?.flag} {src?.name}</div>
                <div className="text-lg font-semibold">{w.source.text}</div>
                <div className="mt-2 text-xs text-slate-500">{tgt?.flag} {tgt?.name}</div>
                <div className="text-2xl font-bold text-blue-700">{w.target.text}</div>
                {w.target.roman && <div className="text-sm text-slate-500 italic">{w.target.roman}</div>}
                <div className="mt-4 flex gap-2">
                  <button className="crystal-btn crystal-btn-sm" onClick={() => tgt && speak(w.target.text, tgt.speech)}>🔊 Listen</button>
                  <button className={`crystal-btn crystal-btn-sm ${w.learned ? 'crystal-btn-light' : 'crystal-btn-green'}`} disabled={w.learned} onClick={() => learned(w)}>{w.learned ? 'Done' : '✔ I know it'}</button>
                </div>
              </div>
            ))}
            {!loading && visibleWords.length === 0 && <p className="col-span-full crystal p-5 text-center text-slate-600">🎉 You have practised all available words in this category for today. Come back tomorrow to review them again!</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
