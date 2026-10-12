import { ReactNode } from 'react';
import { useAuth } from '../auth';

interface Props {
  hero: ReactNode; title: string; subtitle: string; selected: string | null; exclude?: string | null;
  onSelect: (code: string) => void; onConfirm: () => void; onBack?: () => void; confirmLabel: string; step: string;
}

export default function LanguagePicker({ hero, title, subtitle, selected, exclude, onSelect, onConfirm, onBack, confirmLabel, step }: Props) {
  const { languages } = useAuth();
  const list = languages.filter((l) => l.code !== exclude);
  return (
    <div className="min-h-screen bg-app px-4 pt-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between text-sm text-blue-700 font-medium">
          {onBack ? <button className="crystal-btn crystal-btn-light crystal-btn-sm" onClick={onBack}>← Back</button> : <span />}
          <span className="crystal px-4 py-1">{step}</span>
        </div>
        <div className="mx-auto w-full max-w-xs sm:max-w-sm mt-2 animate-pop">{hero}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900">{title}</h1>
        <p className="text-center text-slate-600 mt-1">{subtitle}</p>
        <div className="flex justify-center mt-3">
          <span className="crystal px-5 py-1.5 text-sm font-semibold text-blue-700">🌍 {languages.length} languages are available</span>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((l, i) => (
            <button key={l.code} onClick={() => onSelect(l.code)} style={{ animationDelay: `${i * 25}ms` }}
              className={`crystal crystal-hover animate-rise text-left p-4 flex items-center gap-3 ${selected === l.code ? 'crystal-selected' : ''}`}>
              <span className="text-3xl">{l.flag}</span>
              <span className="min-w-0">
                <span className="block font-semibold truncate">{l.name}</span>
                <span className="block text-xs text-slate-500 truncate">{l.native}</span>
              </span>
              {selected === l.code && <span className="ml-auto text-blue-600 text-xl">✔</span>}
            </button>
          ))}
          {!list.length && <p className="col-span-full text-center text-slate-500">No languages available.</p>}
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 p-4 flex justify-center bg-gradient-to-t from-white/90 to-transparent">
        <button className="crystal-btn w-full max-w-md" disabled={!selected} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  );
}
