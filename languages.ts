export interface Language { code: string; name: string; native: string; flag: string; speech: string }

// The language options requested for SpeakSphere. Browser speech support varies by device.
export const LANGUAGES: Language[] = [
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', speech: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', speech: 'de-DE' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', speech: 'ko-KR' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', speech: 'zh-CN' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', speech: 'ja-JP' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', speech: 'ta-IN' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', speech: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', speech: 'hi-IN' },
];

export const langName = (code: string) => LANGUAGES.find((l) => l.code === code)?.name || code;
export const isLang = (code: unknown): code is string =>
  typeof code === 'string' && LANGUAGES.some((l) => l.code === code);
