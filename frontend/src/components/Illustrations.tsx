import { ReactNode } from 'react';

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="SpeakSphere logo">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#1d4ed8" /></linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg1)" />
      <rect x="1" y="1" width="62" height="30" rx="16" fill="#fff" opacity=".18" />
      <circle cx="32" cy="29" r="15" fill="none" stroke="#fff" strokeWidth="2.6" />
      <ellipse cx="32" cy="29" rx="6.5" ry="15" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M17 29h30M20 21h24M20 37h24" stroke="#fff" strokeWidth="1.8" fill="none" />
      <path d="M20 44l-4 10 12-7z" fill="#fff" />
    </svg>
  );
}

const Bubble = ({ x, y, w = 78, text, fill = '#fff', color = '#1d4ed8' }: { x: number; y: number; w?: number; text: string; fill?: string; color?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height="34" rx="14" fill={fill} stroke="#0f172a" strokeOpacity=".08" />
    <path d={`M${x + 14} ${y + 33} l-6 11 l16 -11z`} fill={fill} />
    <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize="15" fontWeight="700" fill={color} fontFamily="Poppins, sans-serif">{text}</text>
  </g>
);

const Face = ({ cx, cy, r = 24, skin = '#fcd9b6', hair = '#1f2937' }: { cx: number; cy: number; r?: number; skin?: string; hair?: string }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={skin} />
    <path d={`M${cx - r} ${cy - 2} a${r} ${r} 0 0 1 ${2 * r} 0 q-${r * 0.6} -${r * 0.5} -${r * 2} 0z`} fill={hair} />
    <circle cx={cx - r * 0.35} cy={cy + 2} r="2.4" fill="#0f172a" />
    <circle cx={cx + r * 0.35} cy={cy + 2} r="2.4" fill="#0f172a" />
    <path d={`M${cx - r * 0.4} ${cy + r * 0.4} q${r * 0.4} ${r * 0.4} ${r * 0.8} 0`} stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>
);

/** Splash hero: globe + speech bubbles in many languages */
export function GlobeHero({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 340" className={className} role="img" aria-label="People talking around the world">
      <defs>
        <radialGradient id="gh" cx=".35" cy=".3"><stop offset="0" stopColor="#f0f9ff" /><stop offset="1" stopColor="#38bdf8" /></radialGradient>
      </defs>
      <ellipse cx="180" cy="318" rx="110" ry="12" fill="#0f172a" opacity=".15" />
      <circle cx="180" cy="170" r="125" fill="url(#gh)" stroke="#fff" strokeWidth="6" />
      <g fill="none" stroke="#fff" strokeWidth="2.5" opacity=".9">
        <ellipse cx="180" cy="170" rx="52" ry="125" /><ellipse cx="180" cy="170" rx="95" ry="125" />
        <path d="M55 170h250M70 110h220M70 230h220" />
      </g>
      <path d="M110 120c18-18 42-14 52 2s-8 30-26 28-36-12-26-30zM205 150c20-10 44 0 46 20s-20 40-38 32-18-40-8-52z" fill="#2563eb" opacity=".35" />
      <g className="animate-float"><Bubble x={28} y={44} text="Hola!" /></g>
      <g className="animate-float-slow"><Bubble x={140} y={14} w={96} text="Bonjour" /></g>
      <g className="animate-float"><Bubble x={262} y={60} text="你好!" w={66} /></g>
      <g className="animate-float-slow"><Bubble x={248} y={150} text="Hello!" w={74} fill="#2563eb" color="#fff" /></g>
      <g className="animate-float"><Bubble x={20} y={150} text="नमस्ते" w={86} fill="#2563eb" color="#fff" /></g>
      <Face cx={180} cy={262} r={34} />
      <rect x="140" y="292" width="80" height="40" rx="20" fill="#1d4ed8" />
      <rect x="170" y="258" width="22" height="34" rx="5" fill="#fff" stroke="#0f172a" strokeOpacity=".2" transform="rotate(12 181 275)" />
    </svg>
  );
}

/** "I speak..." page: reader on a stack of books with speech bubbles */
export function LearnerHero({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} role="img" aria-label="Learner sitting on books">
      <circle cx="180" cy="130" r="108" fill="#bfdbfe" />
      <circle cx="260" cy="80" r="40" fill="#93c5fd" opacity=".6" />
      <g className="animate-float"><Bubble x={40} y={34} text="HOLA!" fill="#fb923c" color="#fff" /></g>
      <g className="animate-float-slow"><Bubble x={140} y={60} text="HELLO!" w={86} fill="#f97316" color="#fff" /></g>
      <g className="animate-float"><Bubble x={246} y={26} text="你好!" w={66} fill="#fb923c" color="#fff" /></g>
      <rect x="60" y="200" width="240" height="22" rx="6" fill="#1e3a8a" />
      <rect x="72" y="178" width="216" height="22" rx="6" fill="#3b82f6" />
      <rect x="84" y="156" width="190" height="22" rx="6" fill="#60a5fa" />
      <rect x="84" y="156" width="190" height="6" rx="3" fill="#fff" opacity=".4" />
      <Face cx={150} cy={104} r={26} hair="#7c2d12" skin="#f5c7a1" />
      <rect x="125" y="128" width="50" height="34" rx="14" fill="#f97316" />
      <rect x="150" y="136" width="46" height="26" rx="4" fill="#1e293b" transform="rotate(-12 170 150)" />
      <circle cx="268" cy="122" r="20" fill="#fcd9b6" />
      <path d="M248 120a20 20 0 0 1 40 0q-20-14-40 0z" fill="#1f2937" />
      <rect x="250" y="142" width="38" height="50" rx="14" fill="#f97316" />
      <rect x="254" y="190" width="12" height="30" rx="5" fill="#2563eb" /><rect x="272" y="190" width="12" height="30" rx="5" fill="#2563eb" />
      <path d="M250 150l-52-34" stroke="#f97316" strokeWidth="9" strokeLinecap="round" />
      <path d="M196 112l-40-28" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** "I want to learn..." page: bullseye + flags */
export function TargetHero({ className = '' }: { className?: string }) {
  const flags = [['🇫🇷', 40, 60], ['🇪🇸', 290, 50], ['🇯🇵', 20, 160], ['🇩🇪', 310, 150], ['🇮🇹', 70, 235], ['🇰🇷', 270, 235], ['🇮🇳', 175, 22]] as const;
  return (
    <svg viewBox="0 0 360 270" className={className} role="img" aria-label="Pick the language you want to learn">
      <circle cx="180" cy="140" r="110" fill="#dbeafe" />
      {[90, 66, 42, 20].map((r, i) => <circle key={r} cx="180" cy="140" r={r} fill={i % 2 ? '#fff' : '#ef4444'} stroke="#fff" strokeWidth="2" />)}
      <circle cx="180" cy="140" r="8" fill="#b91c1c" />
      <path d="M180 140L282 40" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" />
      <path d="M282 40l-4 -26 22 10 -4 22z" fill="#2563eb" />
      {flags.map(([f, x, y], i) => (
        <text key={i} x={x} y={y} fontSize="34" className={i % 2 ? 'animate-float' : 'animate-float-slow'}>{f}</text>
      ))}
      <g className="animate-float"><Bubble x={120} y={214} w={120} text="Let's learn!" fill="#2563eb" color="#fff" /></g>
    </svg>
  );
}

/** First-lesson welcome: waving student */
export function WelcomeHero({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 300" className={className} role="img" aria-label="Student waving hello">
      <circle cx="180" cy="150" r="125" fill="#e0f2fe" />
      <text x="40" y="70" fontSize="34" className="animate-float">🎯</text>
      <text x="290" y="120" fontSize="34" className="animate-float-slow">🏆</text>
      <text x="30" y="210" fontSize="30" className="animate-float-slow">💡</text>
      <text x="300" y="230" fontSize="30" className="animate-float">⭐</text>
      <g className="animate-float-slow"><Bubble x={228} y={34} text="Let's go!" w={92} fill="#2563eb" color="#fff" /></g>
      <path d="M120 300v-70a60 56 0 0 1 120 0v70z" fill="#2563eb" />
      <path d="M150 232q30 30 60 0" stroke="#1d4ed8" strokeWidth="6" fill="none" />
      <rect x="150" y="240" width="52" height="40" rx="6" fill="#fff" stroke="#0f172a" strokeOpacity=".15" />
      <path d="M228 220q50 -30 36 -92" stroke="#2563eb" strokeWidth="26" strokeLinecap="round" fill="none" />
      <circle cx="262" cy="118" r="14" fill="#fcd9b6" />
      <Face cx={180} cy={140} r={40} hair="#111827" />
      <path d="M150 130q30 -30 60 0" fill="#111827" opacity="0" />
      <path d="M158 156q22 20 44 0" stroke="#7f1d1d" strokeWidth="3" fill="#fff" strokeLinecap="round" />
    </svg>
  );
}

const FLAGS = ['🇪🇸', '🇬🇧', '🇯🇵', '🇨🇳', '🇰🇷', '🇮🇳', '🇺🇦', '🇸🇪', '🇬🇷', '🇮🇹', '🇩🇪', '🇫🇷'];

/** Friendly robot tutor (optionally ringed by flags) */
export function RobotHead({ className = '', flags = false }: { className?: string; flags?: boolean }) {
  return (
    <svg viewBox="0 0 320 320" className={className} role="img" aria-label="Robot tutor">
      {flags && FLAGS.map((f, i) => {
        const a = (i / FLAGS.length) * Math.PI * 2 - Math.PI / 2;
        return <text key={i} x={160 + Math.cos(a) * 138 - 14} y={160 + Math.sin(a) * 138 + 12} fontSize="28">{f}</text>;
      })}
      <line x1="160" y1="62" x2="160" y2="84" stroke="#0f172a" strokeWidth="5" />
      <circle cx="160" cy="54" r="12" fill="none" stroke="#0f172a" strokeWidth="5" />
      <rect x="62" y="136" width="22" height="64" rx="11" fill="#fff" stroke="#0f172a" strokeWidth="5" />
      <rect x="236" y="136" width="22" height="64" rx="11" fill="#fff" stroke="#0f172a" strokeWidth="5" />
      <rect x="78" y="82" width="164" height="150" rx="50" fill="#fff" stroke="#0f172a" strokeWidth="6" />
      <rect x="96" y="106" width="128" height="100" rx="36" fill="#0f172a" stroke="#0ea5e9" strokeWidth="8" />
      <path d="M126 160q14 -18 28 0M166 160q14 -18 28 0" stroke="#38bdf8" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M112 262q48 -26 96 0v30h-96z" fill="#fff" stroke="#0f172a" strokeWidth="5" />
    </svg>
  );
}

/** Semi-transparent robot used behind chat messages */
export function RobotWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      <RobotHead flags className="w-[min(75%,420px)] opacity-[0.13] saturate-150" />
    </div>
  );
}

export function Bubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[['8%', '12%', 90], ['82%', '8%', 140], ['70%', '72%', 110], ['4%', '78%', 160], ['45%', '92%', 70]].map(([l, t, s], i) => (
        <span key={i} className="absolute rounded-full bg-white/15 border border-white/30 animate-float-slow"
          style={{ left: l as string, top: t as string, width: s as number, height: s as number, animationDelay: `${i * 0.7}s` }} />
      ))}
    </div>
  );
}

/** Big faint logo used as the auth-page background */
export function LogoWatermark(): ReactNode {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.14]" aria-hidden>
      <Logo size={560} />
    </div>
  );
}
