// Browser speech: text-to-speech + speech-to-text (Chrome / Edge / Safari work best)
export function speak(text: string, lang: string): boolean {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.9;
  window.speechSynthesis.speak(u);
  return true;
}

export const canListen = () => !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export interface Listener { stop: () => void }
export function listen(
  lang: string,
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
  onError: (msg: string) => void
): Listener | null {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = lang; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
  rec.onresult = (e: any) => {
    const r = e.results[e.results.length - 1];
    onText(r[0].transcript, r.isFinal);
  };
  rec.onerror = (e: any) => {
    if (e.error === 'not-allowed') onError('Microphone permission is blocked. Allow it in the browser address bar.');
    else if (e.error === 'no-speech') onError('I did not hear anything. Try again.');
    else if (e.error !== 'aborted') onError(`Speech recognition error: ${e.error}`);
  };
  rec.onend = onEnd;
  rec.start();
  return { stop: () => rec.stop() };
}

const clean = (s: string) => s.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, '');
export function similarity(a: string, b: string): number {
  const x = clean(a), y = clean(b);
  if (!x || !y) return 0;
  const d: number[][] = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 0; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return Math.round((1 - d[x.length][y.length] / Math.max(x.length, y.length)) * 100);
}
