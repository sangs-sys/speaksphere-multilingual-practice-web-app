import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { canListen, listen, Listener, speak } from '../speech';
import { useToast } from '../toast';
import { RobotWatermark } from './Illustrations';

interface Msg { role: 'user' | 'assistant'; content: string; roman?: string | null; translation?: string }
const CHAT_TITLE = 'Daily Chat';

export default function ChatPanel({ voice = false }: { voice?: boolean }) {
  const { user, lang } = useAuth();
  const { badges } = useToast();
  const tgt = lang(user?.targetLang);
  const [topic] = useState('General conversation');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mock, setMock] = useState(false);
  const [err, setErr] = useState('');
  const [listening, setListening] = useState(false);
  const rec = useRef<Listener | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  useEffect(() => { start('General conversation'); return () => { window.speechSynthesis?.cancel(); rec.current?.stop(); }; /* eslint-disable-next-line */ }, []);

  async function ask(history: Msg[], isStart: boolean, t: string) {
    setBusy(true); setErr('');
    try {
      const r = await api<{ reply: string; roman?: string | null; mock: boolean; newBadges: { emoji: string; title: string }[] }>('/ai/chat', {
        body: { messages: history.map(({ role, content }) => ({ role, content })), topic: t, start: isStart },
      });
      setMock(r.mock);
      setMsgs([...history, { role: 'assistant', content: r.reply, roman: r.roman }]);
      badges(r.newBadges);
      // In live-AI mode, automatically show the source-language meaning under the target-language reply.
      if (!r.mock) {
        try {
          const tr = await api<{ translation: string }>('/ai/translate', { body: { text: r.reply } });
          setMsgs((current) => current.map((m, i) => i === current.length - 1 && m.role === 'assistant' && m.content === r.reply ? { ...m, translation: tr.translation } : m));
        } catch { /* Keep the original reply usable if translation is temporarily unavailable. */ }
      }
      if (voice && tgt) speak(r.reply, tgt.speech);
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Chat failed.'); }
    finally { setBusy(false); }
  }
  function start(t: string) { setMsgs([]); ask([], true, t); }
  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput('');
    ask([...msgs, { role: 'user', content: t }].map((m) => m as Msg), false, topic);
    setMsgs((m) => [...m, { role: 'user', content: t }]);
  }
  function mic() {
    if (!tgt) return;
    if (listening) { rec.current?.stop(); return; }
    setErr(''); setListening(true);
    rec.current = listen(tgt.speech,
      (text, final) => { setInput(text); if (final) { setListening(false); send(text); } },
      () => setListening(false), (m) => { setErr(m); setListening(false); });
    if (!rec.current) { setListening(false); setErr('Voice input needs Chrome, Edge or Safari.'); }
  }
  async function translate(i: number) {
    try {
      const r = await api<{ translation: string }>('/ai/translate', { body: { text: msgs[i].content } });
      setMsgs((m) => m.map((x, j) => (j === i ? { ...x, translation: r.translation } : x)));
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Translation failed.'); }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="px-1 pb-1">
        <h1 className="text-xl font-bold text-slate-800">{CHAT_TITLE}</h1>
        <p className="text-sm text-slate-500">Talk about anything — I’ll follow your conversation.</p>
      </div>

      <div className="crystal relative flex-1 min-h-0 overflow-hidden">
        <RobotWatermark />
        <div className="relative h-full overflow-y-auto scroll-thin p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-rise`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${m.role === 'user'
                ? 'text-white bg-gradient-to-b from-sky-400 to-blue-600 rounded-br-md' : 'bg-white/90 border border-white rounded-bl-md'}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === 'assistant' && m.roman && <p className="mt-1 text-sm italic text-blue-700 whitespace-pre-wrap"><span className="not-italic font-semibold">🔤 How to read it:</span> {m.roman}</p>}
                {m.translation && <p className="mt-1 pt-1 border-t border-slate-200 text-sm text-slate-500"><span className="font-semibold">🌐 {lang(user?.sourceLang)?.name}:</span> {m.translation}</p>}
                {m.role === 'assistant' && (
                  <div className="mt-1 flex gap-3 text-sm">
                    <button title="Listen" onClick={() => tgt && speak(m.content, tgt.speech)}>🔊</button>
                    {!m.translation && <button title={`Translate to ${lang(user?.sourceLang)?.name || 'source language'}`} onClick={() => translate(i)}>🌐 Translate</button>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="text-slate-500 text-sm animate-pulse">🤖 typing…</div>}
          {err && <div className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{err}</div>}
          <div ref={end} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input className="crystal-input" value={input} disabled={busy}
          placeholder={listening ? '🎙️ Listening…' : `Type in ${tgt?.name || 'your language'}…`}
          onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} />
        {canListen() && (
          <button onClick={mic} title="Speak" className={`crystal-btn ${listening ? 'crystal-btn-red animate-ring' : 'crystal-btn-green'} !px-4`}>🎤</button>
        )}
        <button className="crystal-btn !px-5" disabled={busy || !input.trim()} onClick={() => send(input)}>Send ➤</button>
      </div>
      {mock && <p className="text-xs text-amber-700">Demo replies only — add ANTHROPIC_API_KEY in backend/.env for real AI conversation.</p>}
    </div>
  );
}
