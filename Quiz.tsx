import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useToast } from '../toast';

interface Q { id: string; emoji: string; prompt: string; options: string[] }
interface Res { id: string; emoji: string; prompt: string; correct: string; yours: string | null; right: boolean }

export default function Quiz() {
  const { badges } = useToast();
  const [qs, setQs] = useState<Q[]>([]);
  const [done, setDone] = useState<{ score: number; total: number } | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Res[] | null>(null);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ completed: boolean; score?: number; total?: number; questions: Q[] }>('/quiz/daily')
      .then((r) => (r.completed ? setDone({ score: r.score!, total: r.total! }) : setQs(r.questions)))
      .catch((e) => setErr(e instanceof ApiError ? e.message : 'Failed.'));
  }, []);

  async function submit(final: Record<string, string>) {
    setBusy(true);
    try {
      const r = await api<{ score: number; total: number; results: Res[]; newBadges: { emoji: string; title: string }[] }>('/quiz/submit', { body: { answers: final } });
      setResults(r.results); setDone({ score: r.score, total: r.total }); badges(r.newBadges);
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Failed.'); } finally { setBusy(false); }
  }
  function pick(opt: string) {
    const a = { ...answers, [qs[i].id]: opt };
    setAnswers(a);
    if (i + 1 < qs.length) setTimeout(() => setI(i + 1), 250); else submit(a);
  }

  if (err) return <div className="max-w-xl mx-auto crystal p-6 text-center"><div className="text-5xl">🧠</div><p className="mt-2 text-red-600">{err}</p></div>;
  if (done) {
    const pct = Math.round((done.score / done.total) * 100);
    return (
      <div className="max-w-xl mx-auto">
        <div className="crystal p-8 text-center animate-pop">
          <div className="text-7xl">{pct === 100 ? '🏅' : pct >= 60 ? '🎉' : '💪'}</div>
          <h1 className="text-3xl font-bold mt-2">{done.score} / {done.total}</h1>
          <p className="text-slate-600">{results ? 'Quiz complete!' : "You've already finished today's quiz. Come back tomorrow for a new one! 🌅"}</p>
          <Link to="/dashboard" className="crystal-btn mt-5">🏠 Dashboard</Link>
        </div>
        {results && (
          <div className="mt-4 space-y-2">
            {results.map((r) => (
              <div key={r.id} className={`crystal p-3 text-sm ${r.right ? '' : 'ring-2 ring-red-300'}`}>
                <div>{r.emoji} {r.prompt}</div>
                <div className={r.right ? 'text-emerald-600 font-semibold' : 'text-red-600'}>
                  {r.right ? '✔ ' : '✘ '}{r.yours ?? '—'}{!r.right && <span className="text-slate-700"> · correct: <b>{r.correct}</b></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (!qs.length) return <p className="text-center animate-pulse mt-10">Preparing today's quiz…</p>;
  const q = qs[i];
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="crystal px-4 py-1">🧠 Daily quiz</span><span>{i + 1} / {qs.length}</span>
      </div>
      <div className="h-2 bg-white/70 rounded-full mt-3 overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="crystal p-6 mt-4 text-center animate-pop" key={q.id}>
        <div className="text-6xl">{q.emoji}</div>
        <h2 className="text-xl font-semibold mt-3">{q.prompt}</h2>
        <div className="mt-5 grid gap-3">
          {q.options.map((o) => (
            <button key={o} disabled={busy} onClick={() => pick(o)}
              className={`crystal-btn crystal-btn-light ${answers[q.id] === o ? '!ring-2 !ring-blue-600' : ''}`}>{o}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
