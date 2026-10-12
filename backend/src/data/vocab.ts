import { pool } from '../db';
import { Concept } from '../data/vocab';
import { aiEnabled, translateWords } from './ai';

export interface Side { text: string; roman?: string | null }
export interface WordView {
  id: string; cat: string; level: string; emoji: string; source: Side | null; target: Side | null;
}

export async function resolveWords(concepts: Concept[], src: string, tgt: string): Promise<WordView[]> {
  const langs = [...new Set([src, tgt].filter((l) => l !== 'en'))];
  const cache = new Map<string, Side>();

  if (langs.length && concepts.length) {
    const r = await pool.query(
      'SELECT concept_id, lang, text, roman FROM word_translations WHERE lang = ANY($1) AND concept_id = ANY($2)',
      [langs, concepts.map((c) => c.id)]);
    for (const row of r.rows) cache.set(`${row.concept_id}|${row.lang}`, { text: row.text, roman: row.roman });
  }

  const get = (c: Concept, lang: string): Side | null => {
    if (lang === 'en') return { text: c.en };
    if (c.tr[lang]) return { text: c.tr[lang].t, roman: c.tr[lang].r };
    return cache.get(`${c.id}|${lang}`) || null;
  };

  if (aiEnabled) {
    for (const lang of langs) {
      const missing = concepts.filter((c) => !get(c, lang));
      if (!missing.length) continue;
      try {
        const out = await translateWords(missing.map((c) => ({ id: c.id, en: c.en })), lang);
        for (const c of missing) {
          const o = out[c.id];
          if (!o || !o.text) continue;
          cache.set(`${c.id}|${lang}`, { text: o.text, roman: o.roman });
          await pool.query(
            `INSERT INTO word_translations(concept_id, lang, text, roman) VALUES ($1,$2,$3,$4)
             ON CONFLICT (concept_id, lang) DO UPDATE SET text=EXCLUDED.text, roman=EXCLUDED.roman`,
            [c.id, lang, o.text, o.roman || null]);
        }
      } catch (e) {
        console.warn(`Word translation to ${lang} failed:`, (e as Error).message);
      }
    }
  }

  return concepts.map((c) => ({
    id: c.id, cat: c.cat, level: c.level, emoji: c.emoji,
    source: get(c, src), target: get(c, tgt),
  }));
}
