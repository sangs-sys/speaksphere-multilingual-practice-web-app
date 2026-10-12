import { config } from '../config';
import { langName } from '../data/languages';

export const aiEnabled = config.aiProvider !== 'mock' && !!config.anthropicKey;
export class AiUnavailable extends Error {}

interface Msg { role: 'user' | 'assistant'; content: string }

// ---- Anthropic provider (swap this function to change provider) ----
async function complete(system: string, messages: Msg[], maxTokens: number): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: config.model, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) throw new Error(`Anthropic API ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data: any = await r.json();
  return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
}

// ---- Mock provider: only for development, always flagged as mock to the UI ----
const MOCK: Record<string, { t: string; r: string }[]> = {
  en: [
    { t: 'That sounds nice! What did you do today?', r: 'dhat saundz nise! wot did yoo doo tuh-day?' },
    { t: 'Interesting! Tell me a little more about that.', r: 'in-tre-sting! tel mee uh lit-ul mor uh-bout dhat.' },
    { t: 'Great effort! What is your favourite food?', r: 'grayt ef-urt! wot iz yor fay-vrit food?' },
  ],
  ta: [
    { t: 'நன்றாக இருக்கிறது! இன்று நீங்கள் என்ன செய்தீர்கள்?', r: 'nandraaga irukkiradhu! indru neengal enna seydheergal?' },
    { t: 'அருமை! உங்களுக்குப் பிடித்த உணவு என்ன?', r: 'arumai! ungalukkup pidiththa unavu enna?' },
    { t: 'சரி! இன்னும் கொஞ்சம் சொல்லுங்கள்.', r: 'sari! innum konjam sollungal.' },
  ],
  hi: [
    { t: 'बहुत अच्छा! आज आपने क्या किया?', r: 'bahut achchha! aaj aapne kya kiya?' },
    { t: 'वाह! आपका पसंदीदा खाना क्या है?', r: 'waah! aapka pasandeeda khaana kya hai?' },
    { t: 'ठीक है! थोड़ा और बताइए।', r: 'theek hai! thoda aur bataaiye.' },
  ],
  fr: [
    { t: 'Très bien ! Qu\u2019est-ce que vous avez fait aujourd\u2019hui ?', r: 'treh byan! kess-kuh voo-zavay fay oh-zhoor-dwee?' },
    { t: 'Super ! Quel est votre plat préféré ?', r: 'soo-per! kel ay vo-truh plah pray-fay-ray?' },
    { t: 'D\u2019accord ! Dites-m\u2019en un peu plus.', r: 'da-kor! deet-mahn un puh ploo.' },
  ],
  de: [
    { t: 'Sehr gut! Was haben Sie heute gemacht?', r: 'zair goot! vahs hah-ben zee hoy-tuh guh-mahkht?' },
    { t: 'Toll! Was ist Ihr Lieblingsessen?', r: 'tol! vahs ist eer leep-lings-es-sen?' },
    { t: 'Okay! Erzählen Sie mir ein bisschen mehr.', r: 'oh-kay! air-tsay-len zee meer ine bis-khen mair.' },
  ],
  ja: [
    { t: 'いいですね！今日は何をしましたか？', r: 'ii desu ne! kyou wa nani o shimashita ka?' },
    { t: 'すごい！好きな食べ物は何ですか？', r: 'sugoi! suki na tabemono wa nan desu ka?' },
    { t: 'そうですか。もう少し教えてください。', r: 'sou desu ka. mou sukoshi oshiete kudasai.' },
  ],
  ko: [
    { t: '좋아요! 오늘 뭐 했어요?', r: 'jo-a-yo! o-neul mwo hae-sseo-yo?' },
    { t: '멋져요! 좋아하는 음식이 뭐예요?', r: 'meot-jyeo-yo! jo-a-ha-neun eum-sik-i mwo-ye-yo?' },
    { t: '그렇군요. 조금 더 말해 주세요.', r: 'geu-reo-kun-yo. jo-geum deo mal-hae ju-se-yo.' },
  ],
  zh: [
    { t: '很好！你今天做了什么？', r: 'hěn hǎo! nǐ jīntiān zuò le shénme?' },
    { t: '太棒了！你最喜欢的食物是什么？', r: 'tài bàng le! nǐ zuì xǐhuān de shíwù shì shénme?' },
    { t: '好的！再多告诉我一点吧。', r: 'hǎo de! zài duō gàosu wǒ yīdiǎn ba.' },
  ],
};

// The AI writes its reply, then a line with only "|||", then the pronunciation / spelling guide.
function splitReply(raw: string): { reply: string; roman: string | null } {
  const i = raw.indexOf('|||');
  if (i < 0) return { reply: raw.trim(), roman: null };
  return { reply: raw.slice(0, i).trim(), roman: raw.slice(i + 3).trim() || null };
}

export async function chat(opts: {
  messages: Msg[]; source: string; target: string; level: string; topic: string;
}): Promise<{ reply: string; roman: string | null; mock: boolean }> {
  if (!aiEnabled) {
    const list = MOCK[opts.target] || MOCK.en;
    const m = list[opts.messages.length % list.length];
    return { reply: m.t, roman: MOCK[opts.target] ? m.r : null, mock: true };
  }
  const T = langName(opts.target);
  const system =
    `You are SpeakSphere's friendly conversation partner, chatting with a learner whose native language is ${langName(opts.source)} ` +
    `and who is practising ${T} at ${opts.level} level. This is an open-ended daily chat, not a fixed-topic exercise.\n` +
    `Reply exactly like a warm, natural, helpful AI conversation partner: 1-3 short sentences in ${T}, plain text only. ` +
    `The learner may ask about any subject, including studies, coding, technology, daily life, food, travel, hobbies, or a new unrelated topic. Answer the actual question accurately and relevantly; do not force the conversation back to a preset topic. Use the conversation history for context. ` +
    `No headings, bullet points, labels, markdown or translations unless the learner asks. React to what they actually said, answer their request first, then keep the chat going with ONE natural follow-up question when appropriate. ` +
    `Keep vocabulary and grammar suitable for ${opts.level} level (beginner = very simple words and short sentences). ` +
    `If the learner made a clear mistake, naturally use the correct form in your reply instead of lecturing. ` +
    `If they write in ${langName(opts.source)} or ask for help, help briefly, then continue in ${T}.\n` +
    `OUTPUT FORMAT (always): first your reply in ${T}. Then a new line containing only ||| . Then, on the lines after it, a spelling / pronunciation guide of that exact reply ` +
    `written in Latin letters, word by word, so the learner can read it aloud (for example Tamil "vanakkam, eppadi irukkeenga?", Hindi "aap kaise hain?", Japanese romaji, Chinese pinyin with tone marks, Korean romanization; ` +
    `for French, German or English give a simple phonetic respelling). Nothing else after the guide.`;
  const msgs = [...opts.messages];
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  const out = splitReply(await complete(system, msgs, 700));
  // Safety net: if the model forgot the spelling guide, ask for it separately so it is always shown.
  if (!out.roman && out.reply) {
    try {
      out.roman = await complete(
        `Write how to read this ${T} text aloud, in Latin letters only (romanization / pinyin / romaji / simple phonetic spelling), word by word. Output only the guide.`,
        [{ role: 'user', content: out.reply }], 400);
    } catch { /* the reply itself is still shown */ }
  }
  return { ...out, mock: false };
}

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!aiEnabled) throw new AiUnavailable('Translation needs an AI key (ANTHROPIC_API_KEY).');
  return complete(
    `Translate from ${langName(from)} to ${langName(to)}. Output only the translation, nothing else.`,
    [{ role: 'user', content: text }], 500);
}

export async function translateWords(
  items: { id: string; en: string }[], lang: string
): Promise<Record<string, { text: string; roman: string }>> {
  if (!aiEnabled) throw new AiUnavailable('Word translation needs an AI key (ANTHROPIC_API_KEY).');
  const raw = await complete(
    `Translate each English word into ${langName(lang)}. Return ONLY a JSON object mapping each id to {"text": native-script word, "roman": Latin-letter pronunciation guide}. No markdown fences.`,
    [{ role: 'user', content: JSON.stringify(items) }], 1500);
  const json = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(json);
}
