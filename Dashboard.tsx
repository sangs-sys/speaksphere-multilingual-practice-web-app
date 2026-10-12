import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { api } from '../api';
import { useAuth } from '../auth';
import { LEVEL_INFO, Summary } from '../types';

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`crystal p-4 sm:p-5 ${className}`}>{children}</div>
);
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899'];

function Ring({ pct }: { pct: number }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#dbeafe" strokeWidth="12" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">{pct}%</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user, lang } = useAuth();
  const [s, setS] = useState<Summary | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api<Summary>('/progress/summary').then(setS).catch((e) => setErr(e.message)); }, []);
  const src = lang(user?.sourceLang), tgt = lang(user?.targetLang);
  const lvl = user?.level ? LEVEL_INFO[user.level] : null;

  const quick = [
    { to: '/chat', emoji: '💬', label: 'Daily conversation', sub: 'Chat with AI' },
    { to: '/learn?cat=fruits', emoji: '🍎', label: 'Fruits', sub: 'Words box' },
    { to: '/learn?cat=vegetables', emoji: '🥕', label: 'Vegetables', sub: 'Words box' },
    { to: '/learn?cat=animals', emoji: '🐶', label: 'Animals', sub: 'Words box' },
    { to: '/learn?cat=emotions', emoji: '😊', label: 'Emotions', sub: 'Words box' },
    { to: '/quiz', emoji: '🧠', label: 'Daily quiz', sub: s?.quizToday.done ? 'Done today ✔' : 'New today!' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.username} 👋</h1>
          <p className="text-slate-600 mt-1">{src?.flag} {src?.name} ➜ {tgt?.flag} {tgt?.name} · {lvl?.emoji} {lvl?.label}</p>
        </div>
        <div className="flex gap-2">
          <span className="crystal px-4 py-2 font-semibold">🔥 {s?.streak ?? 0} day streak</span>
          <span className="crystal px-4 py-2 font-semibold">⭐ {s?.xp ?? 0} XP</span>
        </div>
      </div>
      {err && <p className="mt-4 text-red-600">{err}</p>}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="flex items-center gap-4">
              <div className="text-6xl">🎯</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">Main goal</div>
                <div className="font-bold">Enhance vocabulary</div>
                <div className="text-xs text-slate-500">{s?.goal.learned ?? 0} of {s?.goal.total ?? 0} {lvl?.label.toLowerCase()} words</div>
              </div>
              <Ring pct={s?.goal.pct ?? 0} />
            </Card>
            <Card className="flex items-center gap-4 bg-amber-50/60">
              <div className="text-6xl drop-shadow-lg">🏆</div>
              <div>
                <div className="text-xs text-slate-500">Latest achievement</div>
                <div className="font-bold">{s?.latestBadge ? `${s.latestBadge.emoji} ${s.latestBadge.title}` : 'Learn your first word!'}</div>
                <Link to="/achievements" className="text-xs text-blue-700 font-medium">{s?.badgeCount ?? 0}/{s?.badgeTotal ?? 10} badges →</Link>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <div className="font-semibold mb-1">Learning progress</div>
              <div className="h-56">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="25%" outerRadius="100%" data={(s?.skills || []).map((k, i) => ({ ...k, fill: COLORS[i] }))} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" background cornerRadius={10} />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {(s?.skills || []).map((k, i) => <span key={k.name}><span style={{ color: COLORS[i] }}>●</span> {k.name} {k.value}%</span>)}
              </div>
            </Card>
            <Card>
              <div className="font-semibold">Speaking progress</div>
              <div className="h-40 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[{ v: s?.speakAvg ?? 0 }, { v: 100 - (s?.speakAvg ?? 0) }]} dataKey="v" startAngle={180} endAngle={0}
                      innerRadius="70%" outerRadius="100%" cy="85%" stroke="none">
                      <Cell fill="#10b981" /><Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-x-0 bottom-3 text-center text-3xl font-bold">{s?.speakAvg ?? 0}%</div>
              </div>
              <div className="text-xs text-center text-slate-500">Average pronunciation score · {s?.speaks ?? 0} attempts</div>
              <div className="mt-3 font-semibold text-sm">Study activity <span className="font-normal text-slate-500">· {s?.minutesWeek ?? 0} min this week</span></div>
              <div className="h-24">
                <ResponsiveContainer>
                  <BarChart data={s?.week || []}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip formatter={(v) => `${v} min`} />
                    <Bar dataKey="minutes" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div>
            <div className="font-semibold mb-2">Jump in</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quick.map((q, i) => (
                <Link key={q.label} to={q.to} style={{ animationDelay: `${i * 60}ms` }} className="crystal crystal-hover animate-rise p-4 flex items-center gap-3">
                  <span className="text-4xl">{q.emoji}</span>
                  <span><span className="block font-semibold leading-tight">{q.label}</span><span className="text-xs text-slate-500">{q.sub}</span></span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="font-bold text-lg">My journey 🧭</div>
          <Card>
            <div className="text-xs text-slate-500">Next milestone</div>
            {s?.nextBadge ? (
              <>
                <div className="font-semibold">{s.nextBadge.emoji} {s.nextBadge.title}</div>
                <div className="text-xs text-slate-500">{s.nextBadge.desc}</div>
                <div className="h-2 rounded-full bg-slate-200 mt-2 overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${(s.nextBadge.value / s.nextBadge.goal) * 100}%` }} /></div>
                <div className="text-xs text-right text-slate-500">{s.nextBadge.value}/{s.nextBadge.goal}</div>
              </>
            ) : <div className="font-semibold">All badges earned 🎉</div>}
          </Card>
          <Card>
            <div className="text-xs text-slate-500">Today's quiz</div>
            <div className="font-semibold">{s?.quizToday.done ? `Done: ${s.quizToday.score}/${s.quizToday.total} ✔` : 'Not taken yet'}</div>
            <Link to="/quiz" className="crystal-btn crystal-btn-sm mt-2">🧠 {s?.quizToday.done ? 'See result' : 'Take quiz'}</Link>
          </Card>
          <div className="rounded-[1.25rem] p-5 text-white shadow-[0_18px_30px_-10px_rgba(29,78,216,.7)]"
            style={{ background: 'linear-gradient(160deg,#3b82f6,#1d4ed8)' }}>
            <div className="text-xs opacity-80">Next lesson</div>
            <div className="text-xl font-bold mt-1">{s?.nextLesson ? `${s.nextLesson.emoji} ${s.nextLesson.name}` : '🎉 All lessons done'}</div>
            {s?.nextLesson && <div className="text-sm opacity-90">{s.nextLesson.remaining} new words waiting</div>}
            <Link to={s?.nextLesson ? `/learn?cat=${s.nextLesson.id}` : '/learn'} className="crystal-btn crystal-btn-light w-full mt-4">Start practice ➜</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
