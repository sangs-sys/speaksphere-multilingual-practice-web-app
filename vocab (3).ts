export type Level = 'beginner' | 'medium' | 'hard';
export interface Concept {
  id: string; cat: string; level: Level; emoji: string; en: string;
  tr: Record<string, { t: string; r: string }>;
}
export const LEVELS: Level[] = ['beginner', 'medium', 'hard'];

export const CATEGORIES = [
  { id: 'greetings', name: 'Greetings', emoji: '👋' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥕' },
  { id: 'animals', name: 'Animals', emoji: '🐶' },
  { id: 'colors', name: 'Colors', emoji: '🎨' },
  { id: 'numbers', name: 'Numbers', emoji: '🔢' },
  { id: 'family', name: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'body', name: 'Body Parts', emoji: '🖐️' },
  { id: 'food', name: 'Food & Drinks', emoji: '🍽️' },
  { id: 'things', name: 'Things', emoji: '🪑' },
  { id: 'emotions', name: 'Emotions', emoji: '😊' },
  { id: 'shapes', name: 'Shapes', emoji: '🔷' },
];

// Each category lists 6 words in order: 2 beginner, 2 medium, 2 hard.
// Row: [emoji, english, tamil, tamilRoman, hindi, hindiRoman, malayalam, malayalamRoman]
// Demo data ships for Tamil / Hindi / Malayalam <-> English. Other languages are translated
// by the AI provider on demand and cached in the DB (needs ANTHROPIC_API_KEY).
type Row = [string, string, string, string, string, string, string, string];
const LEVEL_ORDER: Level[] = ['beginner', 'beginner', 'medium', 'medium', 'hard', 'hard'];

const RAW: Record<string, Row[]> = {
  greetings: [
    ['👋', 'hello', 'வணக்கம்', 'vanakkam', 'नमस्ते', 'namaste', 'നമസ്കാരം', 'namaskaram'],
    ['🙏', 'thank you', 'நன்றி', 'nandri', 'धन्यवाद', 'dhanyavaad', 'നന്ദി', 'nandi'],
    ['🌅', 'good morning', 'காலை வணக்கம்', 'kaalai vanakkam', 'सुप्रभात', 'suprabhaat', 'സുപ്രഭാതം', 'suprabhaatham'],
    ['🤲', 'please', 'தயவுசெய்து', 'dayavu seydhu', 'कृपया', 'kripya', 'ദയവായി', 'dayavaayi'],
    ['🙋', 'excuse me', 'மன்னிக்கவும்', 'mannikkavum', 'क्षमा कीजिए', 'kshama kijiye', 'ക്ഷമിക്കണം', 'kshamikkanam'],
    ['🤗', 'welcome', 'வரவேற்கிறோம்', 'varaverkirom', 'स्वागत है', 'swagat hai', 'സ്വാഗതം', 'swagatham'],
  ],
  fruits: [
    ['🍎', 'apple', 'ஆப்பிள்', 'aappil', 'सेब', 'seb', 'ആപ്പിൾ', 'aappil'],
    ['🍌', 'banana', 'வாழைப்பழம்', 'vaazhaippazham', 'केला', 'kela', 'വാഴപ്പഴം', 'vaazhappazham'],
    ['🥭', 'mango', 'மாம்பழம்', 'maambazham', 'आम', 'aam', 'മാമ്പഴം', 'maambazham'],
    ['🍇', 'grapes', 'திராட்சை', 'thiraatchai', 'अंगूर', 'angoor', 'മുന്തിരി', 'munthiri'],
    ['🔴', 'pomegranate', 'மாதுளை', 'maadhulai', 'अनार', 'anaar', 'മാതളനാരങ്ങ', 'maathalanaranga'],
    ['🍈', 'jackfruit', 'பலாப்பழம்', 'palaappazham', 'कटहल', 'kathal', 'ചക്ക', 'chakka'],
  ],
  vegetables: [
    ['🥔', 'potato', 'உருளைக்கிழங்கு', 'urulaikizhangu', 'आलू', 'aaloo', 'ഉരുളക്കിഴങ്ങ്', 'urulakkizhangu'],
    ['🍅', 'tomato', 'தக்காளி', 'thakkaali', 'टमाटर', 'tamatar', 'തക്കാളി', 'thakkaali'],
    ['🥕', 'carrot', 'கேரட்', 'kerat', 'गाजर', 'gaajar', 'കാരറ്റ്', 'kaarat'],
    ['🧅', 'onion', 'வெங்காயம்', 'vengaayam', 'प्याज़', 'pyaaz', 'സവാള', 'savaala'],
    ['🥦', 'cauliflower', 'காலிஃபிளவர்', 'kaaliflavar', 'फूलगोभी', 'phoolgobhi', 'കോളിഫ്ലവർ', 'koliflavar'],
    ['🍆', 'eggplant', 'கத்தரிக்காய்', 'kathirikkaai', 'बैंगन', 'baingan', 'വഴുതനങ്ങ', 'vazhuthananga'],
  ],
  animals: [
    ['🐶', 'dog', 'நாய்', 'naai', 'कुत्ता', 'kutta', 'നായ', 'naaya'],
    ['🐱', 'cat', 'பூனை', 'poonai', 'बिल्ली', 'billi', 'പൂച്ച', 'poocha'],
    ['🐄', 'cow', 'பசு', 'pasu', 'गाय', 'gaay', 'പശു', 'pashu'],
    ['🐘', 'elephant', 'யானை', 'yaanai', 'हाथी', 'haathi', 'ആന', 'aana'],
    ['🦚', 'peacock', 'மயில்', 'mayil', 'मोर', 'mor', 'മയിൽ', 'mayil'],
    ['🐿️', 'squirrel', 'அணில்', 'anil', 'गिलहरी', 'gilahri', 'അണ്ണാൻ', 'annaan'],
  ],
  colors: [
    ['🔴', 'red', 'சிவப்பு', 'sivappu', 'लाल', 'laal', 'ചുവപ്പ്', 'chuvappu'],
    ['🔵', 'blue', 'நீலம்', 'neelam', 'नीला', 'neela', 'നീല', 'neela'],
    ['🟢', 'green', 'பச்சை', 'pachchai', 'हरा', 'hara', 'പച്ച', 'paccha'],
    ['🟡', 'yellow', 'மஞ்சள்', 'manjal', 'पीला', 'peela', 'മഞ്ഞ', 'manja'],
    ['🟣', 'purple', 'ஊதா', 'oodhaa', 'बैंगनी', 'baingani', 'പർപ്പിൾ', 'parppil'],
    ['🟠', 'orange', 'ஆரஞ்சு', 'aaranju', 'नारंगी', 'naarangi', 'ഓറഞ്ച്', 'oranj'],
  ],
  numbers: [
    ['1️⃣', 'one', 'ஒன்று', 'ondru', 'एक', 'ek', 'ഒന്ന്', 'onnu'],
    ['2️⃣', 'two', 'இரண்டு', 'irandu', 'दो', 'do', 'രണ്ട്', 'randu'],
    ['5️⃣', 'five', 'ஐந்து', 'aindhu', 'पाँच', 'paanch', 'അഞ്ച്', 'anchu'],
    ['🔟', 'ten', 'பத்து', 'paththu', 'दस', 'das', 'പത്ത്', 'pathu'],
    ['💯', 'hundred', 'நூறு', 'nooru', 'सौ', 'sau', 'നൂറ്', 'nooru'],
    ['🔢', 'thousand', 'ஆயிரம்', 'aayiram', 'हज़ार', 'hazaar', 'ആയിരം', 'aayiram'],
  ],
  family: [
    ['👩', 'mother', 'அம்மா', 'amma', 'माँ', 'maa', 'അമ്മ', 'amma'],
    ['👨', 'father', 'அப்பா', 'appa', 'पिता', 'pitaa', 'അച്ഛൻ', 'achchhan'],
    ['👦', 'brother', 'சகோதரன்', 'sagodharan', 'भाई', 'bhai', 'സഹോദരൻ', 'sahodharan'],
    ['👧', 'sister', 'சகோதரி', 'sagodhari', 'बहन', 'behen', 'സഹോദരി', 'sahodhari'],
    ['👵', 'grandmother', 'பாட்டி', 'paatti', 'दादी', 'daadi', 'മുത്തശ്ശി', 'muthashi'],
    ['👨‍🦱', 'uncle', 'மாமா', 'maama', 'चाचा', 'chaacha', 'അമ്മാവൻ', 'ammaavan'],
  ],
  body: [
    ['✋', 'hand', 'கை', 'kai', 'हाथ', 'haath', 'കൈ', 'kai'],
    ['👁️', 'eye', 'கண்', 'kan', 'आँख', 'aankh', 'കണ്ണ്', 'kannu'],
    ['👃', 'nose', 'மூக்கு', 'mookku', 'नाक', 'naak', 'മൂക്ക്', 'mookku'],
    ['👂', 'ear', 'காது', 'kaadhu', 'कान', 'kaan', 'ചെവി', 'chevi'],
    ['💪', 'shoulder', 'தோள்', 'thol', 'कंधा', 'kandha', 'തോൾ', 'thol'],
    ['🦵', 'knee', 'முழங்கால்', 'muzhangaal', 'घुटना', 'ghutna', 'മുട്ട്', 'muttu'],
  ],
  food: [
    ['💧', 'water', 'தண்ணீர்', 'thanneer', 'पानी', 'paani', 'വെള്ളം', 'vellam'],
    ['🍚', 'rice', 'சாதம்', 'saadham', 'चावल', 'chaawal', 'ചോറ്', 'choru'],
    ['🥛', 'milk', 'பால்', 'paal', 'दूध', 'doodh', 'പാൽ', 'paal'],
    ['🍞', 'bread', 'ரொட்டி', 'rotti', 'रोटी', 'roti', 'റൊട്ടി', 'rotti'],
    ['🥒', 'pickle', 'ஊறுகாய்', 'oorugaai', 'अचार', 'achaar', 'അച്ചാർ', 'achaar'],
    ['🥤', 'buttermilk', 'மோர்', 'mor', 'छाछ', 'chhaachh', 'മോര്', 'moru'],
  ],
  things: [
    ['📖', 'book', 'புத்தகம்', 'puthagam', 'किताब', 'kitaab', 'പുസ്തകം', 'pusthakam'],
    ['🪑', 'chair', 'நாற்காலி', 'naarkaali', 'कुर्सी', 'kursi', 'കസേര', 'kasera'],
    ['📱', 'phone', 'தொலைபேசி', 'tholaipesi', 'फ़ोन', 'phone', 'ഫോൺ', 'phone'],
    ['🍽️', 'table', 'மேஜை', 'mejai', 'मेज़', 'mez', 'മേശ', 'mesha'],
    ['☂️', 'umbrella', 'குடை', 'kudai', 'छाता', 'chhaata', 'കുട', 'kuda'],
    ['🔑', 'key', 'சாவி', 'saavi', 'चाबी', 'chaabi', 'താക്കോൽ', 'thaakkol'],
  ],
  emotions: [
    ['😊', 'happy', 'மகிழ்ச்சி', 'magizhchi', 'खुश', 'khush', 'സന്തോഷം', 'santhosham'],
    ['😢', 'sad', 'சோகம்', 'sogam', 'उदास', 'udaas', 'ദുഃഖം', 'dukham'],
    ['😠', 'angry', 'கோபம்', 'kobam', 'गुस्सा', 'gussa', 'ദേഷ്യം', 'deshyam'],
    ['😲', 'surprised', 'ஆச்சரியம்', 'aachariyam', 'हैरान', 'hairaan', 'അത്ഭുതം', 'athbhutham'],
    ['😰', 'nervous', 'பதட்டம்', 'padhattam', 'घबराया हुआ', 'ghabraaya hua', 'പരിഭ്രാന്തി', 'paribhraanthi'],
    ['😌', 'proud', 'பெருமை', 'perumai', 'गर्व', 'garv', 'അഭിമാനം', 'abhimaanam'],
  ],
  shapes: [
    ['⭕', 'circle', 'வட்டம்', 'vattam', 'वृत्त', 'vritt', 'വൃത്തം', 'vruttham'],
    ['🟦', 'square', 'சதுரம்', 'sadhuram', 'वर्ग', 'varg', 'ചതുരം', 'chathuram'],
    ['🔺', 'triangle', 'முக்கோணம்', 'mukkonam', 'त्रिभुज', 'tribhuj', 'ത്രികോണം', 'thrikonam'],
    ['⭐', 'star', 'நட்சத்திரம்', 'natchathiram', 'तारा', 'taara', 'നക്ഷത്രം', 'nakshathram'],
    ['▭', 'rectangle', 'செவ்வகம்', 'sevvagam', 'आयत', 'aayat', 'ദീർഘചതുരം', 'deerghachathuram'],
    ['❤️', 'heart', 'இதயம்', 'idhayam', 'दिल', 'dil', 'ഹൃദയം', 'hrudayam'],
  ],
};

export const CONCEPTS: Concept[] = Object.entries(RAW).flatMap(([cat, rows]) =>
  rows.map((r, i) => ({
    id: `${cat}_${r[1].toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    cat,
    level: LEVEL_ORDER[i],
    emoji: r[0],
    en: r[1],
    tr: { ta: { t: r[2], r: r[3] }, hi: { t: r[4], r: r[5] }, ml: { t: r[6], r: r[7] } },
  }))
);

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));
export const isLevel = (v: unknown): v is Level => v === 'beginner' || v === 'medium' || v === 'hard';
