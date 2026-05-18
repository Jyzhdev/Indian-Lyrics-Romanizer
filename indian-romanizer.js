
(function IndianRomanizer() {

    if (!Spicetify?.Player || !Spicetify?.Platform || !Spicetify?.Topbar) {
        setTimeout(IndianRomanizer, 300);
        return;
    }

    const SCRIPTS = [
        { id: "devanagari", label: "Hindi (Devanagari)", regex: /[ऀ-ॿ]/ },
        { id: "gurmukhi", label: "Punjabi (Gurmukhi)", regex: /[਀-੿]/ },
        { id: "bengali", label: "Bengali", regex: /[ঀ-৿]/ },
        { id: "gujarati", label: "Gujarati", regex: /[઀-૿]/ },
        { id: "odia", label: "Odia", regex: /[଀-୿]/ },
        { id: "tamil", label: "Tamil", regex: /[஀-௿]/ },
        { id: "telugu", label: "Telugu", regex: /[ఀ-౿]/ },
        { id: "kannada", label: "Kannada", regex: /[ಀ-೿]/ },
        { id: "malayalam", label: "Malayalam", regex: /[ഀ-ൿ]/ },
        { id: "urdu", label: "Urdu (Arabic)", regex: /[؀-ۿ]/ },
    ];

    const ANY_INDIAN = /[ऀ-ॿ਀-੿ঀ-৿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ؀-ۿ]/;

    const devanagariMap = {

        "अ": "a", "आ": "aa", "इ": "i", "ई": "ee",
        "उ": "u", "ऊ": "oo", "ए": "e", "ऐ": "ai",
        "ओ": "o", "औ": "au", "ऋ": "ri",

        "क": "k", "ख": "kh", "ग": "g", "घ": "gh",
        "च": "ch", "छ": "chh", "ज": "j", "झ": "jh",
        "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh",
        "ण": "n", "त": "t", "थ": "th", "द": "d",
        "ध": "dh", "न": "n", "प": "p", "फ": "ph",
        "ब": "b", "भ": "bh", "म": "m", "य": "y",
        "र": "r", "ल": "l", "व": "v", "श": "sh",
        "ष": "sh", "स": "s", "ह": "h",

        "ा": "aa", "ि": "i", "ी": "ee", "ु": "u",
        "ू": "oo", "े": "e", "ै": "ai", "ो": "o",
        "ौ": "au", "ृ": "ri",

        "ं": "n", "ः": "h", "ँ": "n", "़": "",

        "क्ष": "ksh", "ज्ञ": "gya",

        "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
    };

    const DEVANAGARI_VIRAMA = "्";

    const gurmukhiMap = {
        "ਅ": "a", "ਆ": "aa", "ਇ": "i", "ਈ": "ee",
        "ਉ": "u", "ਊ": "oo", "ਏ": "e", "ਐ": "ai",
        "ਓ": "o", "ਔ": "au",
        "ਕ": "k", "ਖ": "kh", "ਗ": "g", "ਘ": "gh",
        "ਙ": "ng", "ਚ": "ch", "ਛ": "chh", "ਜ": "j",
        "ਝ": "jh", "ਞ": "ny", "ਟ": "t", "ਠ": "th",
        "ਡ": "d", "ਢ": "dh", "ਣ": "n", "ਤ": "t",
        "ਥ": "th", "ਦ": "d", "ਧ": "dh", "ਨ": "n",
        "ਪ": "p", "ਫ": "ph", "ਬ": "b", "ਭ": "bh",
        "ਮ": "m", "ਯ": "y", "ਰ": "r", "ਲ": "l",
        "ਵ": "v", "ਸ": "s", "ਹ": "h",

        "ਸ਼": "sh",

        "ਾ": "aa", "ਿ": "i", "ੀ": "ee", "ੁ": "u",
        "ੂ": "oo", "ੇ": "e", "ੈ": "ai", "ੋ": "o",
        "ੌ": "au",

        "ੰ": "n", "ਃ": "h", "ਂ": "n", "਼": "",

        "ਖ਼": "kh", "ਗ਼": "g", "ਜ਼": "z", "ਫ਼": "f", "ਲ਼": "l", "ੜ": "r",
    };
    const GURMUKHI_VIRAMA = "੍";
    const GURMUKHI_ADDAK = "ੱ";

    const bengaliMap = {

        "অ": "a", "আ": "aa", "ই": "i", "ঈ": "ee",
        "উ": "u", "ঊ": "oo", "ঋ": "ri", "এ": "e",
        "ঐ": "oi", "ও": "o", "ঔ": "ou",

        "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh",
        "ঙ": "ng", "চ": "ch", "ছ": "chh", "জ": "j",
        "ঝ": "jh", "ঞ": "ny", "ট": "t", "ঠ": "th",
        "ড": "d", "ঢ": "dh", "ণ": "n", "ত": "t",
        "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
        "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh",
        "ম": "m", "য": "j", "র": "r", "ল": "l",
        "শ": "sh", "ষ": "sh", "স": "s", "হ": "h",
        "ৎ": "t",

        "ড়": "r", "ড়": "r",
        "ঢ়": "rh", "ঢ়": "rh",
        "য়": "y", "য়": "y",

        "া": "aa", "ি": "i", "ী": "ee", "ু": "u",
        "ূ": "oo", "ৃ": "ri", "ে": "e", "ৈ": "oi",
        "ো": "o", "ৌ": "ou",

        "ং": "ng", "ঃ": "h", "ঁ": "n", "়": ""
    };
    const BENGALI_VIRAMA = "্";

    const gujaratiMap = {
        "અ": "a", "આ": "aa", "ઇ": "i", "ઈ": "ee",
        "ઉ": "u", "ઊ": "oo", "એ": "e", "ઐ": "ai",
        "ઓ": "o", "ઔ": "au",
        "ક": "k", "ખ": "kh", "ગ": "g", "ઘ": "gh",
        "ચ": "ch", "છ": "chh", "જ": "j", "ઝ": "jh",
        "ટ": "t", "ઠ": "th", "ડ": "d", "ઢ": "dh",
        "ણ": "n", "ત": "t", "થ": "th", "દ": "d",
        "ધ": "dh", "ન": "n", "પ": "p", "ફ": "ph",
        "બ": "b", "ભ": "bh", "મ": "m", "ય": "y",
        "ર": "r", "લ": "l", "વ": "v", "શ": "sh",
        "ષ": "sh", "સ": "s", "હ": "h",

        "ા": "aa", "િ": "i", "ી": "ee", "ુ": "u",
        "ૂ": "oo", "ે": "e", "ૈ": "ai", "ો": "o",
        "ૌ": "au",

        "ં": "n", "ઃ": "h",
    };
    const GUJARATI_VIRAMA = "્";

    const odiaMap = {
        "ଅ": "a", "ଆ": "aa", "ଇ": "i", "ଈ": "ee",
        "ଉ": "u", "ଊ": "oo", "ଏ": "e", "ଐ": "ai",
        "ଓ": "o", "ଔ": "au",
        "କ": "k", "ଖ": "kh", "ଗ": "g", "ଘ": "gh",
        "ଙ": "ng", "ଚ": "ch", "ଛ": "chh", "ଜ": "j",
        "ଝ": "jh", "ଟ": "t", "ଠ": "th", "ଡ": "d",
        "ଢ": "dh", "ଣ": "n", "ତ": "t", "ଥ": "th",
        "ଦ": "d", "ଧ": "dh", "ନ": "n", "ପ": "p",
        "ଫ": "ph", "ବ": "b", "ଭ": "bh", "ମ": "m",
        "ଯ": "y", "ର": "r", "ଲ": "l", "ଵ": "v",
        "ଶ": "sh", "ଷ": "sh", "ସ": "s", "ହ": "h",

        "ା": "aa", "ି": "i", "ୀ": "ee", "ୁ": "u",
        "ୂ": "oo", "େ": "e", "ୈ": "ai", "ୋ": "o",
        "ୌ": "au",

        "ଂ": "n", "ଃ": "h",
    };
    const ODIA_VIRAMA = "୍";

    const tamilMap = {

        "அ": "a", "ஆ": "aa", "இ": "i", "ஈ": "ee",
        "உ": "u", "ஊ": "oo", "எ": "e", "ஏ": "ae",
        "ஐ": "ai", "ஒ": "o", "ஓ": "o", "ஔ": "au",

        "க": "k", "ங": "ng", "ச": "s", "ஞ": "ny",
        "ட": "d", "ண": "n", "த": "th", "ந": "n",
        "ப": "p", "ம": "m", "ய": "y", "ர": "r",
        "ல": "l", "வ": "v", "ழ": "zh", "ள": "l",
        "ற": "r", "ன": "n", "ஜ": "j", "ஷ": "sh",
        "ஸ": "s", "ஹ": "h",
        "ச்ச": "ch", "ட்ட": "tt", "ஞ்ச": "nj", "ம்ப": "mb", "ங்க": "ng",

        "ா": "aa", "ி": "i", "ீ": "ee", "ு": "u",
        "ூ": "oo", "ெ": "e", "ே": "ae", "ை": "ai",
        "ொ": "o", "ோ": "o", "ௌ": "au",
    };
    const TAMIL_VIRAMA = "்";

    const teluguMap = {
        "అ": "a", "ఆ": "aa", "ఇ": "i", "ఈ": "ee",
        "ఉ": "u", "ఊ": "oo", "ఎ": "e", "ఏ": "ae",
        "ఐ": "ai", "ఒ": "o", "ఓ": "oo", "ఔ": "au",
        "క": "k", "ఖ": "kh", "గ": "g", "ఘ": "gh",
        "చ": "ch", "ఛ": "chh", "జ": "j", "ఝ": "jh",
        "ట": "t", "ఠ": "th", "డ": "d", "ఢ": "dh",
        "ణ": "n", "త": "t", "థ": "th", "ద": "d",
        "ధ": "dh", "న": "n", "ప": "p", "ఫ": "ph",
        "బ": "b", "భ": "bh", "మ": "m", "య": "y",
        "ర": "r", "ల": "l", "వ": "v", "శ": "sh",
        "ష": "sh", "స": "s", "హ": "h",

        "ా": "aa", "ి": "i", "ీ": "ee", "ు": "u",
        "ూ": "oo", "ె": "e", "ే": "ae", "ై": "ai",
        "ొ": "o", "ో": "oo", "ౌ": "au",

        "ం": "m", "ః": "h",
    };
    const TELUGU_VIRAMA = "్";

    const kannadaMap = {
        "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ee",
        "ಉ": "u", "ಊ": "oo", "ಎ": "e", "ಏ": "ae",
        "ಐ": "ai", "ಒ": "o", "ಓ": "oo", "ಔ": "au",
        "ಕ": "k", "ಖ": "kh", "ಗ": "g", "ಘ": "gh",
        "ಚ": "ch", "ಛ": "chh", "ಜ": "j", "ಝ": "jh",
        "ಟ": "t", "ಠ": "th", "ಡ": "d", "ಢ": "dh",
        "ಣ": "n", "ತ": "t", "ಥ": "th", "ದ": "d",
        "ಧ": "dh", "ನ": "n", "ಪ": "p", "ಫ": "ph",
        "ಬ": "b", "ಭ": "bh", "ಮ": "m", "ಯ": "y",
        "ರ": "r", "ಲ": "l", "ವ": "v", "ಶ": "sh",
        "ಷ": "sh", "ಸ": "s", "ಹ": "h",

        "ಾ": "aa", "ಿ": "i", "ೀ": "ee", "ು": "u",
        "ೂ": "oo", "ೆ": "e", "ೇ": "ae", "ೈ": "ai",
        "ೊ": "o", "ೋ": "oo", "ೌ": "au",

        "ಂ": "m", "ಃ": "h",
    };
    const KANNADA_VIRAMA = "್";

    const malayalamMap = {
        "അ": "a", "ആ": "aa", "ഇ": "i", "ഈ": "ee",
        "ഉ": "u", "ഊ": "oo", "എ": "e", "ഏ": "ae",
        "ഐ": "ai", "ഒ": "o", "ഓ": "oo", "ഔ": "au",
        "ക": "k", "ഖ": "kh", "ഗ": "g", "ഘ": "gh",
        "ങ": "ng", "ച": "ch", "ഛ": "chh", "ജ": "j",
        "ഝ": "jh", "ഞ": "ny", "ട": "t", "ഠ": "th",
        "ഡ": "d", "ഢ": "dh", "ണ": "n", "ത": "t",
        "ഥ": "th", "ദ": "d", "ധ": "dh", "ന": "n",
        "പ": "p", "ഫ": "ph", "ബ": "b", "ഭ": "bh",
        "മ": "m", "യ": "y", "ര": "r", "ല": "l",
        "വ": "v", "ശ": "sh", "ഷ": "sh", "സ": "s",
        "ഹ": "h", "ള": "l", "ഴ": "zh", "റ": "r",

        "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u",
        "ൂ": "oo", "െ": "e", "േ": "ae", "ൈ": "ai",
        "ൊ": "o", "ോ": "oo", "ൌ": "au",

        "ം": "m", "ഃ": "h",
    };
    const MALAYALAM_VIRAMA = "്";

    const urduMap = {
        "ا": "a", "ب": "b", "پ": "p", "ت": "t",
        "ٹ": "t", "ث": "s", "ج": "j", "چ": "ch",
        "ح": "h", "خ": "kh", "د": "d", "ڈ": "d",
        "ذ": "z", "ر": "r", "ڑ": "r", "ز": "z",
        "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
        "ض": "z", "ط": "t", "ظ": "z", "ع": "a",
        "غ": "gh", "ف": "f", "ق": "q", "ک": "k",
        "گ": "g", "ل": "l", "م": "m", "ن": "n",
        "ں": "n", "و": "w", "ہ": "h", "ھ": "h",
        "ی": "y", "ے": "e",

        "ك": "k", "ي": "y", "ه": "h", "آ": "aa",
        "ئ": "y", "ة": "t", "أ": "a", "إ": "i",
        "ؤ": "u", "ء": "'", "ٱ": "a", "ٰ": "a", "ى": "a",

        "َ": "a", "ِ": "i", "ُ": "u",
        "ً": "an", "ٍ": "in", "ٌ": "un",

    };
    const URDU_SUKUN = "ْ";
    const URDU_SHADDA = "ّ";

    const DEVANAGARI_PHONETIC_DICT = {
        "हमने": "humne",
        "तुमने": "tumne",
        "अपने": "apne",
        "सपना": "sapna",
        "सपने": "sapne",
        "करके": "karke",

        "लड़की": "larki",
        "लड़की": "larki",
        "रहा": "raha",
        "रही": "rahee",
        "रहे": "rahe",
        "हुआ": "hua",
        "हुई": "hui",
        "हुए": "hue",
        "गया": "gaya",
        "गई": "gayee",
        "गए": "gaye",
        "दिया": "diya",
        "लिया": "liya",
        "किया": "kiya",
        "कहा": "kaha",
        "यहाँ": "yahan",
        "कहाँ": "kahan",
        "वहाँ": "wahan",
        "जहाँ": "jahan",
        "था": "tha",
        "थी": "thi",
        "थे": "the",
        "है": "hai",
        "हैं": "hain",
        "मैं": "mein",
        "और": "aur",
        "नहीं": "nahin",
        "नही": "nahin",
        "कर": "kar",
        "पर": "par",
        "घर": "ghar",
        "हर": "har",
        "भर": "bhar",
        "सब": "sab",
        "अब": "ab",
        "कब": "kab",
        "जब": "jab",
        "तब": "tab"
    };

    const URDU_PHONETIC_DICT = {

        "کن": "kun",
        "کُن": "kun",
        "فیکون": "fayakoon",
        "فَیکون": "fayakoon",
        "فَيَكُون": "fayakoon",
        "فيكن": "fayakun",

        "صلی": "Salla",
        "صلّی": "Salla",
        "صلّى": "Salla",
        "علیہ": "Alayhi",
        "وسلم": "Wasallam",
        "صدق": "Sadaqa",
        "العلی": "Al-Ali",
        "العظیم": "Al-Azeem",
        "رسولہ": "Rasooluhu",
        "النبی": "An-Nabi",
        "الکریم": "Al-Kareem",
        "رسول": "Rasool",
        "نبی": "Nabi",
        "کریم": "Kareem",
        "عظیم": "Azeem",
        "علی": "Ali",
        "حق": "Haq",
        "یا": "Ya",

        "کالیاں": "kaliyan",
        "باریاں": "bariyan",
        "گڈیاں": "gadiyan",
        "نوں": "nu",
        "لاواں": "lawan",
        "سپیڈ": "speed",
        "چلاں": "chalan",
        "پلس": "police",
        "سامنے": "samne",
        "سامٹے": "samne",
        "نئیں": "nai",
        "رکدا": "rukda",
        "رُکدا": "rukda",
        "بریکاں": "breakan",
        "ٹیٹر": "tyre",
        "دی": "di",
        "دے": "de",
        "چیخ": "cheekh",
        "کڈھدا": "kadhda",
        "سارے": "sare",
        "لوکی": "loki",
        "تکدے": "takde",
        "کیہہ": "ki",
        "گیا": "gaya",
        "لگدا": "lagda",
        "انج": "anj",
        "رک": "ruk",
        "دو": "do",
        "سو": "so",
        "وی": "wi",

        "اللہ": "Allah",
        "ہے": "hai",
        "ہیں": "hain",
        "میں": "mein",
        "تھا": "tha",
        "تھی": "thi",
        "تھے": "the",
        "کی": "ki",
        "کے": "ke",
        "کا": "ka",
        "کو": "ko",
        "کر": "kar",
        "پر": "par",
        "سے": "se",
        "تم": "tum",
        "ہم": "hum",
        "وہ": "woh",
        "یہ": "yeh",
        "اور": "aur",
        "نہیں": "nahin",
        "نہ": "na",
        "تو": "to",
        "جو": "jo",
        "کوئی": "koi",
        "میرا": "mera",
        "میری": "meri",
        "میرے": "mere",
        "تیرا": "tera",
        "تیری": "teri",
        "تیرے": "tere",
        "ہو": "ho",
        "ہونا": "hona",
        "ہوا": "hua",
        "ہوئے": "hue",
        "ہوئی": "hui",
        "پیار": "pyar",
        "محبت": "mohabbat",
        "عشق": "ishq",
        "زندگی": "zindagi",
        "دل": "dil",
        "صنم": "sanam",
        "یار": "yaar",
        "دوست": "dost",
        "تمہارا": "tumhara",
        "تمہاری": "tumhari",
        "تمہارے": "tumhare",
        "ہمارا": "hamara",
        "ہماری": "hamari",
        "ہمارے": "hamare",
        "اپنا": "apna",
        "اپنی": "apni",
        "اپنے": "apne",
        "ایک": "ek",
        "تین": "teen"
    };

    const TAMIL_PHONETIC_DICT = {
        "இல்லை": "illai",
        "என்ன": "enna",
        "நான்": "naan",
        "நீ": "nee",
        "எனக்கு": "enakku",
        "உனக்கு": "unakku",
        "காதல்": "kaadhal",
        "நீயே": "neeyae",
    };

    const TELUGU_PHONETIC_DICT = {
        "హే": "hae",
        "నీ": "nee",
        "అయ్య": "ayya",
        "చెయ్య": "cheyya",
        "జెయ్య": "jeyya",
        "జంబలికే": "jambalike",
        "జంబాలికే": "jambaalike",
    };

    const STORAGE_KEY = "indian-romanizer-settings";

    function defaultSettings() {
        const scripts = {};
        SCRIPTS.forEach(s => { scripts[s.id] = true; });
        return { enabled: true, autoDetect: true, scripts };
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultSettings();
            const saved = JSON.parse(raw);

            const def = defaultSettings();
            return {
                enabled: saved.enabled ?? def.enabled,
                autoDetect: saved.autoDetect ?? def.autoDetect,
                scripts: Object.assign({}, def.scripts, saved.scripts || {}),
            };
        } catch (_) {
            return defaultSettings();
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    let settings = loadSettings();

    function isIndicConsonant(char) {
        if (!char) return false;
        const cp = char.codePointAt(0);
        return (
            (cp >= 0x0915 && cp <= 0x0939) ||
            (cp >= 0x0958 && cp <= 0x095F) ||
            (cp >= 0x0A15 && cp <= 0x0A39) ||
            (cp >= 0x0A59 && cp <= 0x0A5C) ||
            (cp === 0x0A5E) ||
            (cp >= 0x0995 && cp <= 0x09B9) ||
            (cp >= 0x09DC && cp <= 0x09DF) ||
            (cp >= 0x0A95 && cp <= 0x0AB9) ||
            (cp >= 0x0B15 && cp <= 0x0B39) ||
            (cp >= 0x0B95 && cp <= 0x0BB9) ||
            (cp >= 0x0C15 && cp <= 0x0C39) ||
            (cp >= 0x0C95 && cp <= 0x0CB9) ||
            (cp >= 0x0D15 && cp <= 0x0D39)
        );
    }

    function isIndicMatra(char) {
        if (!char) return false;
        const cp = char.codePointAt(0);
        return (
            (cp >= 0x093E && cp <= 0x094F) || (cp >= 0x0962 && cp <= 0x0963) ||
            (cp >= 0x09BE && cp <= 0x09C4) || (cp >= 0x09C7 && cp <= 0x09C8) || (cp >= 0x09CB && cp <= 0x09CC) || (cp === 0x09D7) ||
            (cp >= 0x0A3E && cp <= 0x0A4F) ||
            (cp >= 0x0ABE && cp <= 0x0ACF) ||
            (cp >= 0x0B3E && cp <= 0x0B4F) || (cp === 0x0B56) || (cp === 0x0B57) ||
            (cp >= 0x0BBE && cp <= 0x0BCF) || (cp === 0x0BD7) ||
            (cp >= 0x0C3E && cp <= 0x0C4F) || (cp === 0x0C55) || (cp === 0x0C56) ||
            (cp >= 0x0CBE && cp <= 0x0CCF) || (cp === 0x0CD5) || (cp === 0x0CD6) ||
            (cp >= 0x0D3E && cp <= 0x0D4F) || (cp === 0x0D57)
        );
    }

    function romanizeIndic(text, map, virama, extraOpts = {}) {
        const { addak, shadda, sukun } = extraOpts;
        const chars = [...text];
        let out = "";
        let i = 0;

        while (i < chars.length) {
            const c = chars[i];

            if (i + 1 < chars.length) {
                const pair = c + chars[i + 1];
                if (map[pair] !== undefined) {
                    out += map[pair];
                    i += 2;
                    continue;
                }

                if (i + 2 < chars.length) {
                    const triple = c + chars[i + 1] + chars[i + 2];
                    if (map[triple] !== undefined) {
                        out += map[triple];
                        i += 3;
                        continue;
                    }
                }
            }

            if (c === virama) {

                if (out.endsWith("a")) {
                    out = out.slice(0, -1);
                }
                i++;
                continue;
            }

            if (addak && c === addak) {

                if (i + 1 < chars.length) {
                    const nextRom = map[chars[i + 1]];
                    if (nextRom) out += nextRom;
                }
                i++;
                continue;
            }

            if (sukun && c === sukun) { i++; continue; }

            if (shadda && c === shadda) {
                const lastVowelIdx = Math.max(
                    out.lastIndexOf("a"), out.lastIndexOf("i"),
                    out.lastIndexOf("u"), out.lastIndexOf("e"),
                    out.lastIndexOf("o")
                );
                const cluster = lastVowelIdx >= 0 ? out.slice(lastVowelIdx + 1) : out.slice(-1);
                if (cluster) out += cluster;
                i++;
                continue;
            }

            const rom = map[c];
            if (rom !== undefined) {
                out += rom;

                if (isIndicConsonant(c)) {
                    let nextC = chars[i + 1];
                    let peekIdx = i + 1;
                    while (peekIdx < chars.length) {
                        const pc = chars[peekIdx];
                        if (pc === "\u093C" || pc === "\u0A3C" || pc === "\u09BC" || (addak && pc === addak)) {
                            peekIdx++;
                            nextC = chars[peekIdx];
                        } else {
                            break;
                        }
                    }

                    const nextIsMatra = nextC && isIndicMatra(nextC);
                    const nextIsVirama = nextC === virama;
                    const nextIsEndOfWord = !nextC || /[\s\p{P}]/u.test(nextC);

                    if (!nextIsMatra && !nextIsVirama && !nextIsEndOfWord) {
                        out += "a";
                    }
                }
            } else {

                out += c;
            }

            i++;
        }

        return out;
    }

    function romanizeDevanagariPhonetic(text) {

        const tokens = text.split(/([\s,،.?!:;()\"'-]+)/);
        const processedTokens = tokens.map(token => {
            if (DEVANAGARI_PHONETIC_DICT[token] !== undefined) {
                return DEVANAGARI_PHONETIC_DICT[token];
            }
            if (/[\u0900-\u097F]/.test(token)) {
                return romanizeIndic(token, devanagariMap, DEVANAGARI_VIRAMA);
            }
            return token;
        });
        return processedTokens.join("");
    }

    function romanizeUrduPhonetic(text) {

        const normalized = text
            .replace(/ك/g, "ک")
            .replace(/ي/g, "ی")
            .replace(/ه/g, "ہ");

        const tokens = normalized.split(/([\s,،.?!:;()\"'-]+)/);

        const processedTokens = tokens.map(token => {

            const cleanToken = token.replace(/[ًٌٍَُِّْ]/g, "");
            if (URDU_PHONETIC_DICT[cleanToken] !== undefined) {
                return URDU_PHONETIC_DICT[cleanToken];
            }
            if (/[؀-ۿ]/.test(token)) {
                return romanizeIndic(token, urduMap, null, { shadda: URDU_SHADDA, sukun: URDU_SUKUN });
            }
            return token;
        });

        return processedTokens.join("");
    }

    function romanizeTamilPhonetic(text) {
        const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
        const out = tokens.map(token => {
            if (TAMIL_PHONETIC_DICT[token] !== undefined) return TAMIL_PHONETIC_DICT[token];
            if (/[\u0B80-\u0BFF]/.test(token)) {
                let rom = romanizeIndic(token, tamilMap, TAMIL_VIRAMA);
                rom = rom.replace(/([^td])du\b/g, "$1de");
                return rom;
            }
            return token;
        });
        return out.join("");
    }

    function romanizeTeluguPhonetic(text) {
        const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
        return tokens.map(token => {
            if (TELUGU_PHONETIC_DICT[token] !== undefined) return TELUGU_PHONETIC_DICT[token];
            if (/[\u0C00-\u0C7F]/.test(token)) {
                return romanizeIndic(token, teluguMap, TELUGU_VIRAMA);
            }
            return token;
        }).join("");
    }

    function romanizeByScript(text, scriptId) {
        switch (scriptId) {
            case "devanagari": return romanizeDevanagariPhonetic(text);
            case "gurmukhi": return romanizeIndic(text, gurmukhiMap, GURMUKHI_VIRAMA, { addak: GURMUKHI_ADDAK });
            case "bengali": return romanizeIndic(text, bengaliMap, BENGALI_VIRAMA);
            case "gujarati": return romanizeIndic(text, gujaratiMap, GUJARATI_VIRAMA);
            case "odia": return romanizeIndic(text, odiaMap, ODIA_VIRAMA);
            case "tamil": return romanizeTamilPhonetic(text);
            case "telugu": return romanizeTeluguPhonetic(text);
            case "kannada": return romanizeIndic(text, kannadaMap, KANNADA_VIRAMA);
            case "malayalam": return romanizeIndic(text, malayalamMap, MALAYALAM_VIRAMA);
            case "urdu": return romanizeUrduPhonetic(text);
            default: return text;
        }
    }

    function detectScript(text) {
        const sample = [...text].slice(0, 50).join("");
        let bestId = null, bestCount = 0;
        for (const s of SCRIPTS) {
            const matches = (sample.match(new RegExp(s.regex.source, "g")) || []).length;
            if (matches > bestCount) {
                bestCount = matches;
                bestId = s.id;
            }
        }
        if (bestCount === 0) return null;
        return bestId;
    }

    function romanizeText(text) {
        if (!text) return text;

        if (settings.autoDetect) {
            return text.split(/(\s+|[,،.?!:;()"'-]+)/).map(token => {
                if (!/\S/.test(token) || !ANY_INDIAN.test(token)) return token;
                const detectedId = detectScript(token);
                if (detectedId) return romanizeByScript(token, detectedId);
                return token;
            }).join("");
        }

        let result = text;
        for (const s of SCRIPTS) {
            if (settings.scripts[s.id] && s.regex.test(result)) {
                result = romanizeByScript(result, s.id);
            }
        }
        return result;
    }

    function processTextNode(node) {
        const current = node.nodeValue;
        if (!current) return;

        if (settings.enabled) {

            if (!node._indianOrig) {
                if (ANY_INDIAN.test(current)) {
                    node._indianOrig = current;
                } else {
                    return;
                }
            }
            const romanized = romanizeText(node._indianOrig);
            if (node.nodeValue !== romanized) node.nodeValue = romanized;
        } else {

            if (node._indianOrig && node.nodeValue !== node._indianOrig) {
                node.nodeValue = node._indianOrig;
            }
        }
    }

    function walkNode(node) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node);
            return;
        }
        if (node.shadowRoot) walkNode(node.shadowRoot);
        for (let c = node.firstChild; c; c = c.nextSibling) walkNode(c);
    }

    function getLyricsContainer() {
        const selectors = [
            "[data-testid='fullscreen-lyric']",
            "[class*='lyrics-lyricsContent']",
            "[class*='lyric']",
            "[data-testid*='lyric']",
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return el.parentElement || el;
        }
        return null;
    }

    function processLyrics() {
        const container = getLyricsContainer();
        if (container) {
            walkNode(container);
        } else {

            const main = document.querySelector("#main") || document.body;
            walkNode(main);
        }
    }

    function walkClearOrigCache(node) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
            delete node._indianOrig;
            return;
        }
        if (node.shadowRoot) walkClearOrigCache(node.shadowRoot);
        for (let c = node.firstChild; c; c = c.nextSibling) walkClearOrigCache(c);
    }

    function clearLyricsOrigCache() {
        const container = getLyricsContainer();
        if (container) walkClearOrigCache(container);
        else {
            const main = document.querySelector("#main");
            if (main) walkClearOrigCache(main);
        }
    }

    let observer = null;
    let lyricsFlushPending = false;

    function scheduleProcessLyrics() {
        if (!settings.enabled) return;
        if (lyricsFlushPending) return;
        lyricsFlushPending = true;
        queueMicrotask(() => {
            lyricsFlushPending = false;
            processLyrics();
        });
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(() => {
            scheduleProcessLyrics();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const TOGGLE_SVG_ON = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#1DB954">
            <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
        </svg>`;
    const TOGGLE_SVG_OFF = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" opacity="0.5">
            <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
        </svg>`;

    function injectStyles() {
        if (document.getElementById("indian-romanizer-styles")) return;
        const style = document.createElement("style");
        style.id = "indian-romanizer-styles";
        style.textContent = `
            .main-topBar-topbarContentRight {
                display: flex !important;
                align-items: center !important;
                flex-shrink: 0 !important;
                min-width: max-content !important;
            }

            #ir-toggle-btn {
                display: flex !important; align-items: center !important; justify-content: center !important;
                width: 32px !important; height: 32px !important; background: transparent !important;
                border: none !important; border-radius: 50% !important; margin-right: 8px !important;
                color: white !important; cursor: pointer !important;
                transition: background 0.2s ease, transform 0.1s ease !important;
                -webkit-app-region: no-drag !important; z-index: 99 !important;
            }
            #ir-toggle-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
            #ir-toggle-btn:active { transform: scale(0.9); }
            #ir-toggle-btn svg { pointer-events: none !important; }

            #indian-romanizer-panel {
                position: fixed;
                top: 60px;
                right: 16px;
                z-index: 9999;
                background: rgba(24, 24, 24, 0.88);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px 20px;
                min-width: 250px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                font-family: "Circular Std", "Helvetica Neue", Helvetica, Arial, sans-serif;
                color: #fff;
                font-size: 13px;
                user-select: none;
                animation: ir-fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes ir-fade-in {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #indian-romanizer-panel h3 {
                margin: 0 0 14px;
                font-size: 15px;
                font-weight: 700;
                background: linear-gradient(90deg, #1db954, #1ed760);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: .5px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ir-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 8px;
                margin: 0 -8px 4px;
                border-radius: 6px;
                transition: background 0.2s ease;
            }
            .ir-row:hover:not(.ir-header-row) {
                background: rgba(255, 255, 255, 0.04);
            }
            .ir-row label {
                cursor: pointer;
                flex: 1;
                color: rgba(255, 255, 255, 0.85);
                font-weight: 500;
                transition: color 0.2s ease;
            }
            .ir-row:hover label {
                color: #ffffff;
            }
            .ir-row label:not([for]) {
                pointer-events: none;
            }
            .ir-divider {
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                margin: 12px -8px;
            }
            /* Toggle switch */
            .ir-toggle {
                position: relative;
                width: 40px !important;
                height: 22px !important;
                flex: none !important;
                cursor: pointer;
            }
            .ir-toggle input {
                position: absolute;
                inset: 0;
                opacity: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                cursor: pointer;
                z-index: 2;
            }
            .ir-slider {
                position: absolute;
                inset: 0;
                background: #444;
                border-radius: 22px;
                transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1;
            }
            .ir-slider::before {
                content: "";
                position: absolute;
                width: 16px; height: 16px;
                left: 3px; top: 3px;
                background: #fff;
                border-radius: 50%;
                transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            }
            .ir-toggle input:checked + .ir-slider { background: #1DB954; }
            .ir-toggle input:checked + .ir-slider::before { transform: translateX(18px); }

            /* Premium Checkbox style */
            .ir-check {
                appearance: none;
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 5px;
                background: transparent;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                flex-shrink: 0;
                margin-left: 8px;
            }
            .ir-check:hover:not(:disabled) {
                border-color: #1ed760;
                background: rgba(29, 185, 84, 0.08);
            }
            .ir-check:checked {
                background: #1DB954;
                border-color: #1DB954;
            }
            .ir-check:checked::after {
                content: "";
                position: absolute;
                width: 4px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                top: 2px;
                left: 5px;
            }
            .ir-check:disabled {
                opacity: 0.25;
                cursor: not-allowed;
                border-color: rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
            }
            .ir-check:active:not(:disabled) {
                transform: scale(0.9);
            }
            .ir-scripts-list {
                max-height: 220px;
                overflow-y: auto;
                padding-right: 4px;
            }
            .ir-scripts-list::-webkit-scrollbar { width: 4px; }
            .ir-scripts-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }
            .ir-scripts-list::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        `;
        document.head.appendChild(style);
    }

    let panel = null;
    let toggleBtn = null;

    function buildPanel() {
        injectStyles();
        const el = document.createElement("div");
        el.id = "indian-romanizer-panel";

        el.innerHTML = `
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                    <text x="50%" y="55%" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
                </svg>
                Indian Romanizer
            </h3>

            <!-- Master toggle -->
            <div class="ir-row">
                <label for="ir-master">Romanization</label>
                <div class="ir-toggle">
                    <input type="checkbox" id="ir-master" ${settings.enabled ? "checked" : ""}>
                    <span class="ir-slider"></span>
                </div>
            </div>

            <hr class="ir-divider">

            <!-- Auto-detect -->
            <div class="ir-row">
                <label for="ir-autodetect">Auto-detect script</label>
                <input type="checkbox" class="ir-check" id="ir-autodetect" ${settings.autoDetect ? "checked" : ""}>
            </div>

            <hr class="ir-divider">

            <!-- Per-script list -->
            <div class="ir-scripts-list" id="ir-script-list"></div>
        `;

        const list = el.querySelector("#ir-script-list");
        SCRIPTS.forEach(s => {
            const row = document.createElement("div");
            row.className = "ir-row";
            const checked = settings.scripts[s.id] ? "checked" : "";
            const disabled = settings.autoDetect ? "disabled" : "";
            row.innerHTML = `
                <label for="ir-script-${s.id}">${s.label}</label>
                <input type="checkbox" class="ir-check ir-script-check"
                       id="ir-script-${s.id}" data-id="${s.id}" ${checked} ${disabled}>
            `;
            list.appendChild(row);
        });

        el.querySelector("#ir-master").addEventListener("change", e => {
            settings.enabled = e.target.checked;
            saveSettings();
            updateButtonIcon();
            processLyrics();
        });

        el.querySelector("#ir-autodetect").addEventListener("change", e => {
            settings.autoDetect = e.target.checked;
            saveSettings();

            el.querySelectorAll(".ir-script-check").forEach(cb => {
                cb.disabled = settings.autoDetect;
            });
            if (settings.enabled) processLyrics();
        });

        el.querySelectorAll(".ir-script-check").forEach(cb => {
            cb.addEventListener("change", e => {
                settings.scripts[e.target.dataset.id] = e.target.checked;
                saveSettings();
                if (settings.enabled) processLyrics();
            });
        });

        document.body.appendChild(el);
        panel = el;

        setTimeout(() => {
            document.addEventListener("click", outsideClickHandler);
        }, 0);
    }

    function outsideClickHandler(e) {
        if (panel && !panel.contains(e.target) && e.target !== toggleBtn) {
            closePanel();
        }
    }

    function openPanel() {
        if (panel) { closePanel(); return; }
        buildPanel();
    }

    function closePanel() {
        if (!panel) return;
        panel.remove();
        panel = null;
        document.removeEventListener("click", outsideClickHandler);
    }

    function updateButtonIcon() {
        if (toggleBtn) {
            toggleBtn.innerHTML = settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;
        }
    }

    function createToggleButton() {
        if (document.getElementById("ir-toggle-btn")) return;
        injectStyles();
        toggleBtn = document.createElement("button");
        toggleBtn.id = "ir-toggle-btn";
        toggleBtn.className = "ir-topbar-button";
        toggleBtn.setAttribute("aria-label", "Toggle Indian Romanization");
        toggleBtn.innerHTML = settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;

        toggleBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            openPanel();
        };

        positionButton();
    }

    function positionButton() {
        if (!toggleBtn) return;

        const bell = document.querySelector('[data-testid="notification-indicator"]') ||
            document.querySelector('button[aria-label="Notifications"]') ||
            document.querySelector('#rr-toggle-btn') ||
            document.querySelector('.main-topBar-topbarContentRight button');

        if (bell) {
            const bellBtn = bell.tagName === "BUTTON" ? bell : bell.closest("button");
            const container = bellBtn?.parentElement || document.querySelector(".main-topBar-topbarContentRight");
            if (container && toggleBtn.parentElement !== container) {

                container.insertBefore(toggleBtn, bellBtn || container.firstChild);
            }
        }
    }

    Spicetify.Player.addEventListener("songchange", () => {
        setTimeout(() => {
            clearLyricsOrigCache();
            if (settings.enabled) processLyrics();
        }, 800);
    });

    function boot() {
        createToggleButton();
        startObserver();

        const topbarObserver = new MutationObserver(positionButton);
        topbarObserver.observe(document.body, { childList: true, subtree: true });

        setTimeout(processLyrics, 1500);
    }

    setTimeout(boot, 2000);

})();