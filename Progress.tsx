import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';
import { Summary } from '../types';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#14b8a6', '#6366f1', '#d946ef'];

export default function Progress() {
  const [s, setS] = useState<Summary | null>(null);
  useEffect(() => { api<Summary>('/progress/summary').then(setS); }, []);
  if (!s) return <p className="text-center animate-pulse mt-10">Loading…</p>;
  const tiles = [
    { e: '⭐', v: s.xp, l: 'XP' }, { e: '🔥', v: s.streak, l: 'Day streak' }, { e: '📚', v: s.words, l: 'Words learned' },
    { e: '🎤', v: `${s.speakAvg}%`, l: 'Speaking avg' }, { e: '🧠', v: s.quizzes, l: 'Quizzes' }, { e: '💬', v: s.chats, l: 'Chat messages' },
  ];
  const activityPie = s.mix.filter((m) => m.value > 0);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t, i) => (
          <div key={t.l} className="crystal crystal-hover animate-rise p-4 text-center" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="text-3xl">{t.e}</div><div className="text-2xl font-bold">{t.v}</div><div className="text-xs text-slate-500">{t.l}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2 mt-5">
        <div className="crystal p-5">
          <div className="font-semibold">Study time & words (last 7 days)</div>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <BarChart data={s.week}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={30} />
                <Tooltip /><Legend />
                <Bar dataKey="minutes" name="Minutes" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="words" name="Words" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500">Minutes are estimated from your activity.</p>
        </div>
        <div className="crystal p-5">
          <div className="font-semibold">What you practised</div>
          {activityPie.length ? (
            <div className="h-64 mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={activityPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3} label>
                    {activityPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-500 mt-6 text-center">Learn a word or take the quiz to see your chart 📈</p>}
        </div>
        <div className="crystal p-5 lg:col-span-2">
          <div className="font-semibold">Words learned by category</div>
          {s.wordsByCategory.length ? (
            <div className="h-64 mt-2">
              <ResponsiveContainer>
                <BarChart data={s.wordsByCategory.map((c) => ({ ...c, name: `${c.emoji} ${c.name}` }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} width={30} /><Tooltip />
                  <Bar dataKey="value" name="Words" radius={[8, 8, 0, 0]}>
                    {s.wordsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-500 mt-6 text-center">No words yet — open Learn and tap “I know it” 📚</p>}
        </div>
      </div>
    </div>
  );
}
