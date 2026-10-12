import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';
import { BadgeInfo } from '../types';

export default function Achievements() {
  const [badges, setBadges] = useState<BadgeInfo[] | null>(null);
  useEffect(() => { api<{ badges: BadgeInfo[] }>('/progress/achievements').then((r) => setBadges(r.badges)); }, []);
  if (!badges) return <p className="text-center animate-pulse mt-10">Loading…</p>;
  const earned = badges.filter((b) => b.earned).length;
  const pie = [{ name: 'Earned', value: earned }, { name: 'Locked', value: badges.length - earned }];
  const bars = badges.map((b) => ({ name: b.emoji, pct: Math.round((b.value / b.goal) * 100), title: b.title }));
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="crystal p-5 flex items-center gap-4">
          <div className="h-40 w-40 relative shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius="65%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill="#f59e0b" /><Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl">🏆</span><b>{earned}/{badges.length}</b></div>
          </div>
          <div><div className="text-xl font-bold">Your trophies</div><p className="text-slate-600 text-sm">Keep learning, speaking and taking the daily quiz to unlock them all.</p></div>
        </div>
        <div className="crystal p-5">
          <div className="font-semibold">Progress to each badge</div>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={bars}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} width={30} unit="%" />
                <Tooltip formatter={(v, _n, p) => [`${v}%`, p.payload.title]} />
                <Bar dataKey="pct" radius={[8, 8, 0, 0]}>{bars.map((b, i) => <Cell key={i} fill={b.pct >= 100 ? '#f59e0b' : '#60a5fa'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b, i) => (
          <div key={b.code} style={{ animationDelay: `${i * 50}ms` }} className={`crystal crystal-hover animate-rise p-5 ${b.earned ? 'bg-amber-50/70' : ''}`}>
            <div className={`text-5xl ${b.earned ? 'drop-shadow-lg' : 'grayscale opacity-50'}`}>{b.emoji}</div>
            <div className="font-semibold mt-2">{b.title}</div>
            <div className="text-xs text-slate-500">{b.desc}</div>
            <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden"><div className={`h-full ${b.earned ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${(b.value / b.goal) * 100}%` }} /></div>
            <div className="text-xs text-slate-500 mt-1">{b.earned ? '✔ Unlocked' : `${b.value}/${b.goal}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
