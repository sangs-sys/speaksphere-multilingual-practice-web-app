import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Logo } from './Illustrations';

const NAV = [
  { to: '/learn', emoji: '📚', label: 'Learn' },
  { to: '/speak', emoji: '🎤', label: 'Speak' },
  { to: '/chat', emoji: '💬', label: 'Daily Chat' },
  { to: '/quiz', emoji: '🧠', label: 'Daily Quiz' },
  { to: '/progress', emoji: '📊', label: 'Progress' },
  { to: '/achievements', emoji: '🏆', label: 'Achievements' },
  { to: '/dashboard', emoji: '🏠', label: 'Dashboard' },
];

export default function Layout() {
  const { user, lang, logout } = useAuth();
  const nav = useNavigate();
  const src = lang(user?.sourceLang), tgt = lang(user?.targetLang);
  return (
    <div className="min-h-screen bg-app lg:pl-72">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 p-4">
        <div className="relative w-full rounded-[2rem] overflow-hidden flex flex-col p-5 text-white shadow-[0_25px_50px_-12px_rgba(29,78,216,.6)]"
          style={{ background: 'linear-gradient(170deg,#38bdf8 0%,#2563eb 55%,#1e40af 100%)' }}>
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/15" />
          <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3 mb-6">
            <Logo size={46} /><span className="text-xl font-bold">SpeakSphere</span>
          </div>
          <div className="relative rounded-2xl bg-white/20 border border-white/40 p-3 mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
            <div className="text-sm opacity-90">Hi, {user?.username} 👋</div>
            <div className="text-xs mt-1 opacity-90">{src?.flag} {src?.name} → {tgt?.flag} {tgt?.name}</div>
          </div>
          <nav className="relative flex-1 flex flex-col gap-2 overflow-y-auto scroll-thin">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-2xl font-medium transition-all ${
                  isActive ? 'bg-white text-blue-700 shadow-[0_10px_20px_-8px_rgba(15,23,42,.45),inset_0_-4px_8px_rgba(147,197,253,.55)] translate-x-1'
                    : 'hover:bg-white/20 border border-transparent hover:border-white/30'}`}>
                <span className="text-xl">{n.emoji}</span>{n.label}
              </NavLink>
            ))}
          </nav>
          <div className="relative flex flex-col gap-2 mt-4">
            <button className="crystal-btn crystal-btn-light crystal-btn-sm" onClick={() => nav('/source')}>🌐 Change language</button>
            <button className="crystal-btn crystal-btn-red crystal-btn-sm" onClick={() => { logout(); nav('/'); }}>🚪 Log out</button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2 text-white"
        style={{ background: 'linear-gradient(90deg,#38bdf8,#2563eb)' }}>
        <div className="flex items-center gap-2"><Logo size={32} /><b>SpeakSphere</b></div>
        <div className="flex gap-2 text-xs">
          <button className="crystal-btn crystal-btn-light crystal-btn-sm" onClick={() => nav('/source')}>🌐</button>
          <button className="crystal-btn crystal-btn-red crystal-btn-sm" onClick={() => { logout(); nav('/'); }}>🚪</button>
        </div>
      </header>

      <main className="p-4 lg:p-6 pb-24 lg:pb-6"><Outlet /></main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-2">
        <div className="crystal flex overflow-x-auto scroll-thin px-1 py-1 gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `flex-1 min-w-[58px] flex flex-col items-center py-1.5 rounded-xl text-[10px] font-medium ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'}`}>
              <span className="text-lg leading-none">{n.emoji}</span>{n.label.replace('Daily ', '')}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
