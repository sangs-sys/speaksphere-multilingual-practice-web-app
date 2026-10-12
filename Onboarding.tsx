import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import LanguagePicker from '../components/LanguagePicker';
import { LearnerHero, TargetHero } from '../components/Illustrations';
import { Level, LEVEL_INFO, User } from '../types';

// Step 1 of 3 — the language you already speak
export function SourcePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [src, setSrc] = useState<string | null>(user?.sourceLang || null);
  return (
    <LanguagePicker step="Step 1 of 3" hero={<LearnerHero className="w-full" />}
      title={`Welcome, ${user?.username} 👋`} subtitle="First, pick the language you already speak"
      selected={src} onSelect={setSrc} confirmLabel="Continue ➜" onConfirm={() => nav('/target', { state: { source: src } })} />
  );
}

// Step 2 of 3 — the language you want to learn
export function TargetPage() {
  const { user, lang } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const source = (loc.state as { source?: string } | null)?.source;
  const [tgt, setTgt] = useState<string | null>(user?.targetLang && user.targetLang !== source ? user.targetLang : null);
  if (!source) return <Navigate to="/source" replace />;
  return (
    <LanguagePicker step="Step 2 of 3" hero={<TargetHero className="w-full" />}
      title="Which language do you want to learn? 🎯" subtitle={`You speak ${lang(source)?.name}. Now choose your target language`}
      selected={tgt} exclude={source} onSelect={setTgt} onBack={() => nav('/source')}
      confirmLabel="Continue ➜" onConfirm={() => nav('/level', { state: { source, target: tgt } })} />
  );
}

// Step 3 of 3 — difficulty
export function LevelPage() {
  const { lang, setUser, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const st = loc.state as { source?: string; target?: string } | null;
  const [level, setLevel] = useState<Level>(user?.level || 'beginner');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (!st?.source || !st?.target) return <Navigate to="/source" replace />;
  async function save() {
    setBusy(true); setErr('');
    try {
      const r = await api<{ user: User }>('/user/prefs', { method: 'PUT', body: { sourceLang: st!.source, targetLang: st!.target, level } });
      setUser(r.user); nav('/learn');
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Could not save.'); setBusy(false); }
  }
  const s = lang(st.source), t = lang(st.target);
  return (
    <div className="min-h-screen bg-app px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-between items-center">
          <button className="crystal-btn crystal-btn-light crystal-btn-sm" onClick={() => nav('/target', { state: { source: st.source } })}>← Back</button>
          <span className="crystal px-4 py-1 text-sm text-blue-700 font-medium">Step 3 of 3</span>
        </div>
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-3 crystal px-6 py-3 text-lg font-semibold animate-pop">
            <span>{s?.flag} {s?.name}</span><span className="text-blue-600">➜</span><span>{t?.flag} {t?.name}</span>
          </div>
          <h1 className="text-3xl font-bold mt-6">How hard should the words be? 💪</h1>
          <p className="text-slate-600 mt-1">You will only get words from the level you choose.</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(Object.keys(LEVEL_INFO) as Level[]).map((l, i) => (
            <button key={l} onClick={() => setLevel(l)} style={{ animationDelay: `${i * 80}ms` }}
              className={`crystal crystal-hover animate-rise p-6 text-center ${level === l ? 'crystal-selected' : ''}`}>
              <div className="text-5xl">{LEVEL_INFO[l].emoji}</div>
              <div className="mt-2 text-xl font-bold">{LEVEL_INFO[l].label}</div>
              <div className="text-sm text-slate-600">{LEVEL_INFO[l].desc}</div>
            </button>
          ))}
        </div>
        {err && <p className="mt-4 text-center text-red-600">{err}</p>}
        <div className="mt-8 flex justify-center">
          <button className="crystal-btn w-full max-w-md" disabled={busy} onClick={save}>{busy ? 'Saving…' : "Let's go! 🚀"}</button>
        </div>
      </div>
    </div>
  );
}
