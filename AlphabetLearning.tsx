import { useMemo } from 'react';
import { speak } from '../speech';
import { useAuth } from '../auth';

type Card = { sourceLetter: string; targetLetter: string; sourceWord: string; targetWord: string; meaning: string };

// How a TARGET-language letter is pronounced / spelled in Latin letters.
// (The source-language letter's sound is intentionally not shown.)
const ROMAN: Record<string, string> = {
  // Devanagari (Hindi)
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ए':'e (ay)','ऐ':'ai','ओ':'o','औ':'au',
  'क':'ka','ख':'kha','ग':'ga','घ':'gha','ङ':'nga','च':'cha','छ':'chha','ज':'ja','झ':'jha','ञ':'nya',
  'ट':'ṭa','ठ':'ṭha','ड':'ḍa','ढ':'ḍha','ण':'ṇa','त':'ta','थ':'tha','द':'da','ध':'dha','न':'na',
  'प':'pa','फ':'pha','ब':'ba','भ':'bha','म':'ma','य':'ya','र':'ra','ल':'la','व':'va','श':'sha','ष':'ṣha','स':'sa','ह':'ha',
  'ळ':'ḷa','ऴ':'zha','ऱ':'ṟa','ज़':'za','क्ष':'ksha',
  // Tamil
  'அ':'a','ஆ':'aa','இ':'i','ஈ':'ee','உ':'u','ஊ':'oo','எ':'e','ஏ':'ē (ay)','ஐ':'ai','ஒ':'o','ஓ':'ō','ஔ':'au',
  'க':'ka','ங':'nga','ச':'cha','ஞ':'nya','ட':'ṭa','ண':'ṇa','த':'tha','ந':'na','ப':'pa','ம':'ma','ய':'ya','ர':'ra','ல':'la','வ':'va',
  'ழ':'zha','ள':'ḷa','ற':'ṟa','ன':'ṉa','ஜ':'ja','ஸ':'sa','ஹ':'ha','க்ஷ':'ksha','ஃப':'fa',
  // English letter names
  A:'ay',B:'bee',C:'see',D:'dee',E:'ee',F:'ef',G:'jee',H:'aitch',I:'eye',J:'jay',K:'kay',L:'el',M:'em',N:'en',O:'oh',P:'pee',Q:'kyoo',
  R:'ar',S:'ess',T:'tee',U:'yoo',V:'vee',W:'double-yoo',X:'eks',Y:'wy',Z:'zee',
};

const TA_HI: Card[] = [
  { sourceLetter:'அ', targetLetter:'अ', sourceWord:'அம்மா', targetWord:'माँ', meaning:'mother' },
  { sourceLetter:'ஆ', targetLetter:'आ', sourceWord:'ஆடு', targetWord:'बकरी', meaning:'goat' },
  { sourceLetter:'இ', targetLetter:'इ', sourceWord:'இலை', targetWord:'पत्ता', meaning:'leaf' },
  { sourceLetter:'ஈ', targetLetter:'ई', sourceWord:'ஈ', targetWord:'मक्खी', meaning:'fly (insect)' },
  { sourceLetter:'உ', targetLetter:'उ', sourceWord:'உப்பு', targetWord:'नमक', meaning:'salt' },
  { sourceLetter:'ஊ', targetLetter:'ऊ', sourceWord:'ஊர்', targetWord:'गाँव', meaning:'village' },
  { sourceLetter:'எ', targetLetter:'ए', sourceWord:'எலி', targetWord:'चूहा', meaning:'mouse' },
  { sourceLetter:'ஏ', targetLetter:'ए', sourceWord:'ஏணி', targetWord:'सीढ़ी', meaning:'ladder' },
  { sourceLetter:'ஐ', targetLetter:'ऐ', sourceWord:'ஐந்து', targetWord:'पाँच', meaning:'five' },
  { sourceLetter:'ஒ', targetLetter:'ओ', sourceWord:'ஒட்டகம்', targetWord:'ऊँट', meaning:'camel' },
  { sourceLetter:'ஓ', targetLetter:'ओ', sourceWord:'ஓநாய்', targetWord:'भेड़िया', meaning:'wolf' },
  { sourceLetter:'ஔ', targetLetter:'औ', sourceWord:'ஔவை', targetWord:'औवैयार', meaning:'Avvaiyar (name)' },
  { sourceLetter:'க', targetLetter:'क', sourceWord:'கல்', targetWord:'पत्थर', meaning:'stone' },
  { sourceLetter:'ங', targetLetter:'ङ', sourceWord:'சங்கு', targetWord:'शंख', meaning:'conch shell' },
  { sourceLetter:'ச', targetLetter:'च', sourceWord:'சட்டை', targetWord:'कमीज़', meaning:'shirt' },
  { sourceLetter:'ஞ', targetLetter:'ञ', sourceWord:'ஞாயிறு', targetWord:'रविवार', meaning:'Sunday' },
  { sourceLetter:'ட', targetLetter:'ट', sourceWord:'டம்ளர்', targetWord:'गिलास', meaning:'tumbler / glass' },
  { sourceLetter:'ண', targetLetter:'ण', sourceWord:'மணி', targetWord:'घंटी', meaning:'bell' },
  { sourceLetter:'த', targetLetter:'त', sourceWord:'தண்ணீர்', targetWord:'पानी', meaning:'water' },
  { sourceLetter:'ந', targetLetter:'न', sourceWord:'நாய்', targetWord:'कुत्ता', meaning:'dog' },
  { sourceLetter:'ப', targetLetter:'प', sourceWord:'பல்', targetWord:'दाँत', meaning:'tooth' },
  { sourceLetter:'ம', targetLetter:'म', sourceWord:'மரம்', targetWord:'पेड़', meaning:'tree' },
  { sourceLetter:'ய', targetLetter:'य', sourceWord:'யானை', targetWord:'हाथी', meaning:'elephant' },
  { sourceLetter:'ர', targetLetter:'र', sourceWord:'ரயில்', targetWord:'रेलगाड़ी', meaning:'train' },
  { sourceLetter:'ல', targetLetter:'ल', sourceWord:'லட்டு', targetWord:'लड्डू', meaning:'laddu' },
  { sourceLetter:'வ', targetLetter:'व', sourceWord:'வானம்', targetWord:'आकाश', meaning:'sky' },
  { sourceLetter:'ழ', targetLetter:'ऴ', sourceWord:'தமிழ்', targetWord:'तमिल', meaning:'Tamil' },
  { sourceLetter:'ள', targetLetter:'ळ', sourceWord:'வளையல்', targetWord:'चूड़ी', meaning:'bangle' },
  { sourceLetter:'ற', targetLetter:'ऱ', sourceWord:'பறவை', targetWord:'पक्षी', meaning:'bird' },
  { sourceLetter:'ன', targetLetter:'न', sourceWord:'மனம்', targetWord:'मन', meaning:'mind' },
];

const EN_ROWS: [string, string, string, string, string, string][] = [
  // [English letter, Hindi letter, Tamil letter, English word, Hindi word, meaning]
  ['A','ए','ஏ','Apple','सेब','apple'],['B','ब','ப','Book','किताब','book'],['C','क','க','Cat','बिल्ली','cat'],['D','ड','ட','Dog','कुत्ता','dog'],
  ['E','ई','ஈ','Elephant','हाथी','elephant'],['F','फ','ஃப','Fish','मछली','fish'],['G','ग','க','Grapes','अंगूर','grapes'],['H','ह','ஹ','House','घर','house'],
  ['I','ऐ','ஐ','Ice','बर्फ','ice'],['J','ज','ஜ','Jug','जग','jug'],['K','क','க','Kite','पतंग','kite'],['L','ल','ல','Lion','शेर','lion'],
  ['M','म','ம','Mango','आम','mango'],['N','न','ந','Nest','घोंसला','nest'],['O','ओ','ஓ','Orange','संतरा','orange'],['P','प','ப','Parrot','तोता','parrot'],
  ['Q','क','க','Queen','रानी','queen'],['R','र','ர','Rose','गुलाब','rose'],['S','स','ஸ','Sun','सूरज','sun'],['T','ट','ட','Tree','पेड़','tree'],
  ['U','उ','உ','Umbrella','छाता','umbrella'],['V','व','வ','Van','वैन','van'],['W','व','வ','Water','पानी','water'],['X','क्ष','க்ஷ','Xylophone','ज़ाइलोफ़ोन','xylophone'],
  ['Y','य','ய','Yak','याक','yak'],['Z','ज़','ஸ','Zebra','ज़ेब्रा','zebra'],
];
const TA_WORD: Record<string, string> = {apple:'ஆப்பிள்',book:'புத்தகம்',cat:'பூனை',dog:'நாய்',elephant:'யானை',fish:'மீன்',grapes:'திராட்சை',house:'வீடு',ice:'பனி',jug:'குடம்',kite:'பட்டம்',lion:'சிங்கம்',mango:'மாம்பழம்',nest:'கூடு',orange:'ஆரஞ்சு',parrot:'கிளி',queen:'ராணி',rose:'ரோஜா',sun:'சூரியன்',tree:'மரம்',umbrella:'குடை',van:'வேன்',water:'தண்ணீர்',xylophone:'சைலோஃபோன்',yak:'யாக்',zebra:'வரிக்குதிரை'};

const EN_HI: Card[] = EN_ROWS.map(([en, hi, , enWord, hiWord, meaning]) => ({ sourceLetter: en, targetLetter: hi, sourceWord: enWord, targetWord: hiWord, meaning }));
const EN_TA: Card[] = EN_ROWS.map(([en, , ta, enWord, , meaning]) => ({ sourceLetter: en, targetLetter: ta, sourceWord: enWord, targetWord: TA_WORD[meaning] || enWord, meaning }));

const swap = (cards: Card[]): Card[] => cards.map((c) => ({ ...c, sourceLetter: c.targetLetter, targetLetter: c.sourceLetter, sourceWord: c.targetWord, targetWord: c.sourceWord }));

function dataFor(source: string, target: string): Card[] {
  if (source === 'ta' && target === 'hi') return TA_HI;
  if (source === 'hi' && target === 'ta') return swap(TA_HI);
  if (source === 'en' && target === 'hi') return EN_HI;
  if (source === 'hi' && target === 'en') return swap(EN_HI);
  if (source === 'en' && target === 'ta') return EN_TA;
  if (source === 'ta' && target === 'en') return swap(EN_TA);
  return [];
}

export default function AlphabetLearning() {
  const { user, lang } = useAuth();
  const src = lang(user?.sourceLang), tgt = lang(user?.targetLang);
  const cards = useMemo(() => dataFor(user?.sourceLang || '', user?.targetLang || ''), [user?.sourceLang, user?.targetLang]);

  return <section className="mt-5">
    {cards.length === 0 ? <div className="crystal p-6"><h3 className="font-bold text-lg">Alphabet cards for this language pair are coming next</h3><p className="mt-2 text-slate-600">This version includes letter lessons for Tamil, Hindi and English in every direction. Use the regular Learn categories for other language pairs.</p></div> :
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => <article key={`${c.sourceLetter}-${i}`} className="crystal crystal-hover p-4 animate-rise" style={{ animationDelay: `${Math.min(i,12)*25}ms` }}>
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className="w-16 h-16 shrink-0 overflow-hidden rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl sm:text-4xl font-bold text-blue-700 leading-none">{c.sourceLetter}</div>
              <div className="text-xs text-slate-500">{src?.name} letter</div>
            </div>
            <div className="text-3xl text-slate-400 mt-3">→</div>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className="w-16 h-16 shrink-0 overflow-hidden rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl font-bold text-violet-700 leading-none">{c.targetLetter}</div>
              <div className="text-xs text-slate-500">{tgt?.name} letter</div>
              <div className="text-sm font-semibold text-violet-700">Sound: {ROMAN[c.targetLetter] || ''}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div><div className="text-xs text-slate-500">{src?.name} example</div><div className="text-base sm:text-lg font-semibold break-words [overflow-wrap:anywhere]">{c.sourceWord}</div></div><div><div className="text-xs text-slate-500">{tgt?.name} example</div><div className="text-base sm:text-lg font-semibold text-violet-700 break-words [overflow-wrap:anywhere]">{c.targetWord}</div></div></div>
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2"><span className="text-xs text-slate-500">Meaning in English</span><div className="font-medium">{c.meaning}</div></div>
          <div className="mt-3 flex gap-2"><button className="crystal-btn crystal-btn-sm" onClick={() => src && speak(c.sourceWord, src.speech)}>🔊 Source</button><button className="crystal-btn crystal-btn-sm crystal-btn-light" onClick={() => tgt && speak(c.targetWord, tgt.speech)}>🔊 Target</button></div>
        </article>)}
      </div>}
  </section>;
}
