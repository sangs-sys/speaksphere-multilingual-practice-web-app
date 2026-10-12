import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import ChatPanel from '../components/ChatPanel';
import { canListen, listen, Listener, similarity, speak } from '../speech';
import { useToast } from '../toast';
import { Category, Word } from '../types';

function WordPractice() {
  const { user, lang } = useAuth();
  const { badges } = useToast();
  const tgt = lang(user?.targetLang);
  const [cats, setCats] = useState<Category[]>([]);
  const [cat, setCat] = useState('greetings');
  const [words, setWords] = useState<Word[]>([]);
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState('');
  const rec = useRef<Listener | null>(null);
  const t0 = useRef(0);

  useEffect(() => { api<{ categories: Category[] }>('/vocab/categories').then((r) => setCats(r.categories)).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    setI(0); setHeard(''); setScore(null);
    api<{ words: Word[] }>(`/vocab/words?category=${cat}`).then((r) => setWords(r.words)).catch((e) => setErr(e.message));
  }, [cat]);

  const w = words[i];
  function start() {
    if (!w || !tgt) return;
    setErr(''); setHeard(''); setScore(null); setListening(true); t0.current = Date.now();
    let last = '';
    rec.current = listen(tgt.speech, (text) => { last = text; setHeard(text); },
      async () => {
        setListening(false);
        if (!last) return;
        const s = similarity(last, w.target.text);
        setScore(s);
        try {
          const r = await api<{ newBadges: { emoji: string; title: string }[] }>('/activity', {
            body: { kind: 'speak', ref: w.id, score: s, seconds: Math.round((Date.now() - t0.current) / 1000) },
          });
          badges(r.newBadges);
        } catch (e) { setErr(e instanceof ApiError ? e.message : 'Could not save score.'); }
      },
      (m) => { setErr(m); setListening(false); });
    if (!rec.current) { setListening(false); setErr('Voice input needs Chrome, Edge or Safari.'); }
  }
  const next = () => { setI((x) => (x + 1) % Math.max(words.length, 1)); setHeard(''); setScore(null); };
  const verdict = score === null ? '' : score >= 80 ? 'Excellent! 🌟' : score >= 50 ? 'Good try! Say it once more 👍' : 'Keep practising 💪';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-2">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`crystal crystal-hover shrink-0 px-3 py-1.5 text-sm font-medium ${cat === c.id ? 'crystal-selected' : ''}`}>{c.emoji} {c.name}</button>
        ))}
      </div>
      {err && <p className="mt-3 text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</p>}
      {w ? (
        <div className="crystal p-6 mt-4 text-center animate-pop" key={w.id}>
          <div className="text-xs text-slate-500">{i + 1} / {words.length}</div>
          <div className="text-7xl mt-2">{w.emoji}</div>
          <div className="text-slate-600 mt-2">{w.source.text}</div>
          <div className="text-4xl font-bold text-blue-700 mt-1">{w.target.text}</div>
          {w.target.roman && <div className="italic text-slate-500">{w.target.roman}</div>}
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <button className="crystal-btn" onClick={() => tgt && speak(w.target.text, tgt.speech)}>🔊 Listen</button>
            <button className={`crystal-btn ${listening ? 'crystal-btn-red animate-ring' : 'crystal-btn-green'}`} onClick={() => (listening ? rec.current?.stop() : start())} disabled={!canListen()}>
              {listening ? '⏹ Stop' : '🎤 Speak'}
            </button>
            <button className="crystal-btn crystal-btn-light" onClick={next}>Next ➜</button>
          </div>
          {!canListen() && <p className="text-sm text-amber-700 mt-3">Your browser has no speech recognition. Use Chrome, Edge or Safari.</p>}
          {listening && <p className="mt-4 animate-pulse">🎙️ Listening… say the word</p>}
          {heard && <p className="mt-4 text-slate-600">I heard: <b>{heard}</b></p>}
          {score !== null && (
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Your speaking accuracy</div>
              <div className="text-4xl font-bold text-blue-700">{score}% correct</div>
              <div className="font-medium">{verdict}</div>
              <p className="text-xs text-slate-500 mt-1">Score = how closely your speech matches the word (browser speech recognition).</p>
            </div>
          )}
        </div>
      ) : <p className="mt-6 text-center text-slate-500">Loading words…</p>}
    </div>
  );
}

export default function Speak() {
  const [tab, setTab] = useState<'words' | 'ai'>('words');
  return (
    <div className="mx-auto max-w-4xl flex flex-col h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-3rem)]">
      <div className="flex gap-2 mb-3 shrink-0">
        <button className={`crystal-btn crystal-btn-sm ${tab === 'words' ? '' : 'crystal-btn-light'}`} onClick={() => setTab('words')}>🎯 Word practice</button>
        <button className={`crystal-btn crystal-btn-sm ${tab === 'ai' ? '' : 'crystal-btn-light'}`} onClick={() => setTab('ai')}>🗣️ Talk with AI</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {tab === 'words' ? <WordPractice /> : <div className="h-full"><ChatPanel voice /></div>}
      </div>
    </div>
  );
}
