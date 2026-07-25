(() => {
  // src/state.js
  var state = {
    settings: null,
    toggleBtn: null,
    panel: null,
    observer: null,
    safetyPassTimer: null,
    playbackScanInterval: null
  };

  // src/scripts/registry.js
  var SCRIPTS = [
    { id: "devanagari", label: "Hindi (Devanagari)", regex: /[ऀ-ॿ]/ },
    { id: "gurmukhi", label: "Punjabi (Gurmukhi)", regex: /[਀-੿]/ },
    { id: "bengali", label: "Bengali", regex: /[ঀ-৿]/ },
    { id: "gujarati", label: "Gujarati", regex: /[઀-૿]/ },
    { id: "odia", label: "Odia", regex: /[଀-୿]/ },
    { id: "tamil", label: "Tamil", regex: /[஀-௿]/ },
    { id: "telugu", label: "Telugu", regex: /[ఀ-౿]/ },
    { id: "kannada", label: "Kannada", regex: /[ಀ-೿]/ },
    { id: "malayalam", label: "Malayalam", regex: /[ഀ-ൿ]/ },
    { id: "urdu", label: "Urdu (Arabic)", regex: /[؀-ۿ]/ }
  ];
  var ANY_INDIAN = /[ऀ-ॿ਀-੿ঀ-৿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ؀-ۿ]/;

  // src/settings.js
  var STORAGE_KEY = "indian-romanizer-settings";
  function defaultSettings() {
    const scripts = {};
    SCRIPTS.forEach((s) => {
      scripts[s.id] = true;
    });
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
        scripts: Object.assign({}, def.scripts, saved.scripts || {})
      };
    } catch (_) {
      return defaultSettings();
    }
  }
  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // src/ui/styles.js
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

        .ir-copy-btn {
            width: 100%;
            margin-top: 12px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
        }
        .ir-copy-btn:hover {
            background: rgba(29, 185, 84, 0.15);
            border-color: #1DB954;
            color: #1DB954;
        }
        .ir-copy-btn:active {
            transform: scale(0.97);
        }
    `;
    document.head.appendChild(style);
  }

  // src/scripts/gurmukhi.js
  var gurmukhiMap = {
    "\u0A05": "a",
    "\u0A06": "aa",
    "\u0A07": "i",
    "\u0A08": "ee",
    "\u0A09": "u",
    "\u0A0A": "oo",
    "\u0A0F": "e",
    "\u0A10": "ai",
    "\u0A13": "o",
    "\u0A14": "au",
    "\u0A15": "k",
    "\u0A16": "kh",
    "\u0A17": "g",
    "\u0A18": "gh",
    "\u0A19": "ng",
    "\u0A1A": "ch",
    "\u0A1B": "chh",
    "\u0A1C": "j",
    "\u0A1D": "jh",
    "\u0A1E": "ny",
    "\u0A1F": "t",
    "\u0A20": "th",
    "\u0A21": "d",
    "\u0A22": "dh",
    "\u0A23": "n",
    "\u0A24": "t",
    "\u0A25": "th",
    "\u0A26": "d",
    "\u0A27": "dh",
    "\u0A28": "n",
    "\u0A2A": "p",
    "\u0A2B": "ph",
    "\u0A2C": "b",
    "\u0A2D": "bh",
    "\u0A2E": "m",
    "\u0A2F": "y",
    "\u0A30": "r",
    "\u0A32": "l",
    "\u0A35": "v",
    "\u0A38": "s",
    "\u0A39": "h",
    "\u0A38\u0A3C": "sh",
    "\u0A3E": "aa",
    "\u0A3F": "i",
    "\u0A40": "ee",
    "\u0A41": "u",
    "\u0A42": "oo",
    "\u0A47": "e",
    "\u0A48": "ai",
    "\u0A4B": "o",
    "\u0A4C": "au",
    "\u0A70": "n",
    "\u0A03": "h",
    "\u0A02": "n",
    "\u0A3C": "",
    "\u0A16\u0A3C": "kh",
    "\u0A17\u0A3C": "g",
    "\u0A1C\u0A3C": "z",
    "\u0A2B\u0A3C": "f",
    "\u0A32\u0A3C": "l",
    "\u0A5C": "r"
  };
  var GURMUKHI_VIRAMA = "\u0A4D";
  var GURMUKHI_ADDAK = "\u0A71";

  // src/scripts/bengali.js
  var bengaliMap = {
    "\u0985": "a",
    "\u0986": "aa",
    "\u0987": "i",
    "\u0988": "ee",
    "\u0989": "u",
    "\u098A": "oo",
    "\u098B": "ri",
    "\u098F": "e",
    "\u0990": "oi",
    "\u0993": "o",
    "\u0994": "ou",
    "\u0995": "k",
    "\u0996": "kh",
    "\u0997": "g",
    "\u0998": "gh",
    "\u0999": "ng",
    "\u099A": "ch",
    "\u099B": "chh",
    "\u099C": "j",
    "\u099D": "jh",
    "\u099E": "ny",
    "\u099F": "t",
    "\u09A0": "th",
    "\u09A1": "d",
    "\u09A2": "dh",
    "\u09A3": "n",
    "\u09A4": "t",
    "\u09A5": "th",
    "\u09A6": "d",
    "\u09A7": "dh",
    "\u09A8": "n",
    "\u09AA": "p",
    "\u09AB": "ph",
    "\u09AC": "b",
    "\u09AD": "bh",
    "\u09AE": "m",
    "\u09AF": "j",
    "\u09B0": "r",
    "\u09B2": "l",
    "\u09B6": "sh",
    "\u09B7": "sh",
    "\u09B8": "s",
    "\u09B9": "h",
    "\u09CE": "t",
    "\u09A1\u09BC": "r",
    "\u09A2\u09BC": "rh",
    "\u09AF\u09BC": "y",
    "\u09BE": "aa",
    "\u09BF": "i",
    "\u09C0": "ee",
    "\u09C1": "u",
    "\u09C2": "oo",
    "\u09C3": "ri",
    "\u09C7": "e",
    "\u09C8": "oi",
    "\u09CB": "o",
    "\u09CC": "ou",
    "\u0982": "ng",
    "\u0983": "h",
    "\u0981": "n",
    "\u09BC": ""
  };
  var BENGALI_VIRAMA = "\u09CD";

  // src/scripts/gujarati.js
  var gujaratiMap = {
    "\u0A85": "a",
    "\u0A86": "aa",
    "\u0A87": "i",
    "\u0A88": "ee",
    "\u0A89": "u",
    "\u0A8A": "oo",
    "\u0A8F": "e",
    "\u0A90": "ai",
    "\u0A93": "o",
    "\u0A94": "au",
    "\u0A95": "k",
    "\u0A96": "kh",
    "\u0A97": "g",
    "\u0A98": "gh",
    "\u0A9A": "ch",
    "\u0A9B": "chh",
    "\u0A9C": "j",
    "\u0A9D": "jh",
    "\u0A9F": "t",
    "\u0AA0": "th",
    "\u0AA1": "d",
    "\u0AA2": "dh",
    "\u0AA3": "n",
    "\u0AA4": "t",
    "\u0AA5": "th",
    "\u0AA6": "d",
    "\u0AA7": "dh",
    "\u0AA8": "n",
    "\u0AAA": "p",
    "\u0AAB": "ph",
    "\u0AAC": "b",
    "\u0AAD": "bh",
    "\u0AAE": "m",
    "\u0AAF": "y",
    "\u0AB0": "r",
    "\u0AB2": "l",
    "\u0AB5": "v",
    "\u0AB6": "sh",
    "\u0AB7": "sh",
    "\u0AB8": "s",
    "\u0AB9": "h",
    "\u0ABE": "aa",
    "\u0ABF": "i",
    "\u0AC0": "ee",
    "\u0AC1": "u",
    "\u0AC2": "oo",
    "\u0AC7": "e",
    "\u0AC8": "ai",
    "\u0ACB": "o",
    "\u0ACC": "au",
    "\u0A82": "n",
    "\u0A83": "h"
  };
  var GUJARATI_VIRAMA = "\u0ACD";

  // src/scripts/odia.js
  var odiaMap = {
    "\u0B05": "a",
    "\u0B06": "aa",
    "\u0B07": "i",
    "\u0B08": "ee",
    "\u0B09": "u",
    "\u0B0A": "oo",
    "\u0B0F": "e",
    "\u0B10": "ai",
    "\u0B13": "o",
    "\u0B14": "au",
    "\u0B15": "k",
    "\u0B16": "kh",
    "\u0B17": "g",
    "\u0B18": "gh",
    "\u0B19": "ng",
    "\u0B1A": "ch",
    "\u0B1B": "chh",
    "\u0B1C": "j",
    "\u0B1D": "jh",
    "\u0B1F": "t",
    "\u0B20": "th",
    "\u0B21": "d",
    "\u0B22": "dh",
    "\u0B23": "n",
    "\u0B24": "t",
    "\u0B25": "th",
    "\u0B26": "d",
    "\u0B27": "dh",
    "\u0B28": "n",
    "\u0B2A": "p",
    "\u0B2B": "ph",
    "\u0B2C": "b",
    "\u0B2D": "bh",
    "\u0B2E": "m",
    "\u0B2F": "y",
    "\u0B30": "r",
    "\u0B32": "l",
    "\u0B35": "v",
    "\u0B36": "sh",
    "\u0B37": "sh",
    "\u0B38": "s",
    "\u0B39": "h",
    "\u0B3E": "aa",
    "\u0B3F": "i",
    "\u0B40": "ee",
    "\u0B41": "u",
    "\u0B42": "oo",
    "\u0B47": "e",
    "\u0B48": "ai",
    "\u0B4B": "o",
    "\u0B4C": "au",
    "\u0B02": "n",
    "\u0B03": "h"
  };
  var ODIA_VIRAMA = "\u0B4D";

  // src/scripts/kannada.js
  var kannadaMap = {
    "\u0C85": "a",
    "\u0C86": "aa",
    "\u0C87": "i",
    "\u0C88": "ee",
    "\u0C89": "u",
    "\u0C8A": "oo",
    "\u0C8E": "e",
    "\u0C8F": "ae",
    "\u0C90": "ai",
    "\u0C92": "o",
    "\u0C93": "oo",
    "\u0C94": "au",
    "\u0C95": "k",
    "\u0C96": "kh",
    "\u0C97": "g",
    "\u0C98": "gh",
    "\u0C9A": "ch",
    "\u0C9B": "chh",
    "\u0C9C": "j",
    "\u0C9D": "jh",
    "\u0C9F": "t",
    "\u0CA0": "th",
    "\u0CA1": "d",
    "\u0CA2": "dh",
    "\u0CA3": "n",
    "\u0CA4": "t",
    "\u0CA5": "th",
    "\u0CA6": "d",
    "\u0CA7": "dh",
    "\u0CA8": "n",
    "\u0CAA": "p",
    "\u0CAB": "ph",
    "\u0CAC": "b",
    "\u0CAD": "bh",
    "\u0CAE": "m",
    "\u0CAF": "y",
    "\u0CB0": "r",
    "\u0CB2": "l",
    "\u0CB5": "v",
    "\u0CB6": "sh",
    "\u0CB7": "sh",
    "\u0CB8": "s",
    "\u0CB9": "h",
    "\u0CBE": "aa",
    "\u0CBF": "i",
    "\u0CC0": "ee",
    "\u0CC1": "u",
    "\u0CC2": "oo",
    "\u0CC6": "e",
    "\u0CC7": "ae",
    "\u0CC8": "ai",
    "\u0CCA": "o",
    "\u0CCB": "oo",
    "\u0CCC": "au",
    "\u0C82": "m",
    "\u0C83": "h"
  };
  var KANNADA_VIRAMA = "\u0CCD";

  // src/scripts/malayalam.js
  var malayalamMap = {
    "\u0D05": "a",
    "\u0D06": "aa",
    "\u0D07": "i",
    "\u0D08": "ee",
    "\u0D09": "u",
    "\u0D0A": "oo",
    "\u0D0E": "e",
    "\u0D0F": "ae",
    "\u0D10": "ai",
    "\u0D12": "o",
    "\u0D13": "oo",
    "\u0D14": "au",
    "\u0D15": "k",
    "\u0D16": "kh",
    "\u0D17": "g",
    "\u0D18": "gh",
    "\u0D19": "ng",
    "\u0D1A": "ch",
    "\u0D1B": "chh",
    "\u0D1C": "j",
    "\u0D1D": "jh",
    "\u0D1E": "ny",
    "\u0D1F": "t",
    "\u0D20": "th",
    "\u0D21": "d",
    "\u0D22": "dh",
    "\u0D23": "n",
    "\u0D24": "t",
    "\u0D25": "th",
    "\u0D26": "d",
    "\u0D27": "dh",
    "\u0D28": "n",
    "\u0D2A": "p",
    "\u0D2B": "ph",
    "\u0D2C": "b",
    "\u0D2D": "bh",
    "\u0D2E": "m",
    "\u0D2F": "y",
    "\u0D30": "r",
    "\u0D32": "l",
    "\u0D35": "v",
    "\u0D36": "sh",
    "\u0D37": "sh",
    "\u0D38": "s",
    "\u0D39": "h",
    "\u0D33": "l",
    "\u0D34": "zh",
    "\u0D31": "r",
    "\u0D3E": "aa",
    "\u0D3F": "i",
    "\u0D40": "ee",
    "\u0D41": "u",
    "\u0D42": "oo",
    "\u0D46": "e",
    "\u0D47": "ae",
    "\u0D48": "ai",
    "\u0D4A": "o",
    "\u0D4B": "oo",
    "\u0D4C": "au",
    "\u0D02": "m",
    "\u0D03": "h"
  };
  var MALAYALAM_VIRAMA = "\u0D4D";

  // src/engine/unicode-ranges.js
  function isIndicConsonant(char) {
    if (!char) return false;
    const cp = char.codePointAt(0);
    return cp >= 2325 && cp <= 2361 || cp >= 2392 && cp <= 2399 || cp >= 2581 && cp <= 2617 || cp >= 2649 && cp <= 2652 || cp === 2654 || cp >= 2453 && cp <= 2489 || cp >= 2524 && cp <= 2527 || cp >= 2709 && cp <= 2745 || cp >= 2837 && cp <= 2873 || cp >= 2965 && cp <= 3001 || cp >= 3093 && cp <= 3129 || cp >= 3221 && cp <= 3257 || cp >= 3349 && cp <= 3385;
  }
  function isIndicMatra(char) {
    if (!char) return false;
    const cp = char.codePointAt(0);
    return cp >= 2366 && cp <= 2383 || cp >= 2402 && cp <= 2403 || cp >= 2494 && cp <= 2500 || cp >= 2503 && cp <= 2504 || cp >= 2507 && cp <= 2508 || cp === 2519 || cp >= 2622 && cp <= 2639 || cp >= 2750 && cp <= 2767 || cp >= 2878 && cp <= 2895 || cp === 2902 || cp === 2903 || cp >= 3006 && cp <= 3023 || cp === 3031 || cp >= 3134 && cp <= 3151 || cp === 3157 || cp === 3158 || cp >= 3262 && cp <= 3279 || cp === 3285 || cp === 3286 || cp >= 3390 && cp <= 3407 || cp === 3415;
  }

  // src/engine/transliterate.js
  var NUKTA_CHARS = /* @__PURE__ */ new Set(["\u093C", "\u0A3C", "\u09BC"]);
  function romanizeIndic(text, map, virama, extraOpts = {}) {
    const { addak, shadda, sukun } = extraOpts;
    const chars = [...text];
    let out = "";
    let i = 0;
    while (i < chars.length) {
      const c = chars[i];
      if (i + 1 < chars.length) {
        const pair = c + chars[i + 1];
        if (map[pair] !== void 0) {
          out += map[pair];
          i += 2;
          continue;
        }
        if (i + 2 < chars.length) {
          const triple = c + chars[i + 1] + chars[i + 2];
          if (map[triple] !== void 0) {
            out += map[triple];
            i += 3;
            continue;
          }
        }
      }
      if (c === virama) {
        if (out.endsWith("a")) out = out.slice(0, -1);
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
      if (sukun && c === sukun) {
        i++;
        continue;
      }
      if (shadda && c === shadda) {
        const lastVowelIdx = Math.max(
          out.lastIndexOf("a"),
          out.lastIndexOf("i"),
          out.lastIndexOf("u"),
          out.lastIndexOf("e"),
          out.lastIndexOf("o")
        );
        const cluster = lastVowelIdx >= 0 ? out.slice(lastVowelIdx + 1) : out.slice(-1);
        if (cluster) out += cluster;
        i++;
        continue;
      }
      const rom = map[c];
      if (rom !== void 0) {
        out += rom;
        if (isIndicConsonant(c)) {
          let nextC = chars[i + 1];
          let peekIdx = i + 1;
          while (peekIdx < chars.length && (NUKTA_CHARS.has(chars[peekIdx]) || addak && chars[peekIdx] === addak)) {
            peekIdx++;
            nextC = chars[peekIdx];
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

  // src/scripts/devanagari.js
  var devanagariMap = {
    "\u0905": "a",
    "\u0906": "aa",
    "\u0907": "i",
    "\u0908": "ee",
    "\u0909": "u",
    "\u090A": "oo",
    "\u090F": "e",
    "\u0910": "ai",
    "\u0913": "o",
    "\u0914": "au",
    "\u090B": "ri",
    "\u0915": "k",
    "\u0916": "kh",
    "\u0917": "g",
    "\u0918": "gh",
    "\u091A": "ch",
    "\u091B": "chh",
    "\u091C": "j",
    "\u091D": "jh",
    "\u091F": "t",
    "\u0920": "th",
    "\u0921": "d",
    "\u0922": "dh",
    "\u0923": "n",
    "\u0924": "t",
    "\u0925": "th",
    "\u0926": "d",
    "\u0927": "dh",
    "\u0928": "n",
    "\u092A": "p",
    "\u092B": "ph",
    "\u092C": "b",
    "\u092D": "bh",
    "\u092E": "m",
    "\u092F": "y",
    "\u0930": "r",
    "\u0932": "l",
    "\u0935": "v",
    "\u0936": "sh",
    "\u0937": "sh",
    "\u0938": "s",
    "\u0939": "h",
    "\u093E": "aa",
    "\u093F": "i",
    "\u0940": "ee",
    "\u0941": "u",
    "\u0942": "oo",
    "\u0947": "e",
    "\u0948": "ai",
    "\u094B": "o",
    "\u094C": "au",
    "\u0943": "ri",
    "\u0902": "n",
    "\u0903": "h",
    "\u0901": "n",
    "\u093C": "",
    "\u0915\u094D\u0937": "ksh",
    "\u091C\u094D\u091E": "gya",
    "\u0915\u093C": "q",
    "\u0916\u093C": "kh",
    "\u0917\u093C": "g",
    "\u091C\u093C": "z",
    "\u0921\u093C": "r",
    "\u0922\u093C": "rh",
    "\u092B\u093C": "f",
    "\u092F\u093C": "y"
  };
  var DEVANAGARI_VIRAMA = "\u094D";
  var DEVANAGARI_PHONETIC_DICT = {
    "\u0939\u092E\u0928\u0947": "humne",
    "\u0924\u0941\u092E\u0928\u0947": "tumne",
    "\u0905\u092A\u0928\u0947": "apne",
    "\u0938\u092A\u0928\u093E": "sapna",
    "\u0938\u092A\u0928\u0947": "sapne",
    "\u0915\u0930\u0915\u0947": "karke",
    "\u0932\u0921\u093C\u0915\u0940": "larki",
    "\u0930\u0939\u093E": "raha",
    "\u0930\u0939\u0940": "rahee",
    "\u0930\u0939\u0947": "rahe",
    "\u0939\u0941\u0906": "hua",
    "\u0939\u0941\u0908": "hui",
    "\u0939\u0941\u090F": "hue",
    "\u0917\u092F\u093E": "gaya",
    "\u0917\u0908": "gayee",
    "\u0917\u090F": "gaye",
    "\u0926\u093F\u092F\u093E": "diya",
    "\u0932\u093F\u092F\u093E": "liya",
    "\u0915\u093F\u092F\u093E": "kiya",
    "\u0915\u0939\u093E": "kaha",
    "\u092F\u0939\u093E\u0901": "yahan",
    "\u0915\u0939\u093E\u0901": "kahan",
    "\u0935\u0939\u093E\u0901": "wahan",
    "\u091C\u0939\u093E\u0901": "jahan",
    "\u0925\u093E": "tha",
    "\u0925\u0940": "thi",
    "\u0925\u0947": "the",
    "\u0939\u0948": "hai",
    "\u0939\u0948\u0902": "hain",
    "\u092E\u0948\u0902": "mein",
    "\u0914\u0930": "aur",
    "\u0928\u0939\u0940\u0902": "nahin",
    "\u0928\u0939\u0940": "nahin",
    "\u0915\u0930": "kar",
    "\u092A\u0930": "par",
    "\u0918\u0930": "ghar",
    "\u0939\u0930": "har",
    "\u092D\u0930": "bhar",
    "\u0938\u092C": "sab",
    "\u0905\u092C": "ab",
    "\u0915\u092C": "kab",
    "\u091C\u092C": "jab",
    "\u0924\u092C": "tab",
    "\u091C\u093F\u0902\u0926\u0917\u0940": "zindagi",
    "\u091C\u093C\u093F\u0902\u0926\u0917\u0940": "zindagi",
    "\u092E\u094B\u0939\u092C\u094D\u092C\u0924": "mohabbat",
    "\u0907\u0936\u094D\u0915": "ishq",
    "\u0907\u0936\u094D\u0915\u093C": "ishq",
    "\u0926\u0940\u0935\u093E\u0928\u093E": "deewana",
    "\u0926\u0940\u0935\u093E\u0928\u0940": "deewani",
    "\u0927\u0921\u093C\u0915\u0928": "dhadkan",
    "\u0906\u0901\u0916\u094B\u0902": "aankhon",
    "\u0938\u093E\u0902\u0938\u094B\u0902": "saanson",
    "\u0926\u093F\u0932": "dil",
    "\u0938\u0902\u0917": "sang",
    "\u0938\u093E\u0925\u0940": "saathi",
    "\u0916\u094D\u0935\u093E\u092C": "khwaab",
    "\u0916\u093C\u0935\u093E\u092C": "khwaab",
    "\u0928\u091C\u093C\u0930": "nazar",
    "\u0924\u0947\u0930\u093E": "tera",
    "\u0924\u0947\u0930\u0940": "teri",
    "\u0924\u0947\u0930\u0947": "tere",
    "\u092E\u0947\u0930\u093E": "mera",
    "\u092E\u0947\u0930\u0940": "meri",
    "\u092E\u0947\u0930\u0947": "mere",
    "\u0916\u0941\u0926\u093E": "khuda",
    "\u0916\u093C\u0941\u0926\u093E": "khuda",
    "\u092E\u093E\u0939\u0940": "maahi",
    "\u0930\u093E\u0901\u091D\u093E": "ranjha",
    "\u092A\u094D\u092F\u093E\u0930": "pyar",
    "\u0926\u0941\u0928\u093F\u092F\u093E": "duniya",
    "\u091A\u0947\u0939\u0930\u093E": "chehra",
    "\u092E\u094C\u0938\u092E": "mausam",
    "\u092C\u093E\u0924\u0947\u0902": "baatein",
    "\u092F\u093E\u0926\u0947\u0902": "yaadein",
    "\u0930\u093E\u0924\u0947": "raatein",
    "\u0930\u093E\u0924\u0947\u0902": "raatein",
    "\u092A\u0932": "pal",
    "\u0928\u091C\u093C\u093E\u0930\u093E": "nazara",
    "\u0916\u0941\u0936\u0940": "khushi",
    "\u0926\u0930\u094D\u0926": "dard"
  };

  // src/engine/devanagari-phonetics.js
  function applyDevanagariSchwaRules(word) {
    if (DEVANAGARI_PHONETIC_DICT[word] !== void 0) return DEVANAGARI_PHONETIC_DICT[word];
    if (!/[\u0900-\u097F]/.test(word)) return word;
    let rom = romanizeIndic(word, devanagariMap, DEVANAGARI_VIRAMA);
    rom = rom.replace(/([bcdfghjklmnpqrstvwxz])a([bcdfghjklmnpqrstvwxz]+)(aa|ee|oo|e|ai|o|au|i|u)/gi, "$1$2$3");
    if (rom.length > 3 && rom.endsWith("a") && !rom.endsWith("aa")) {
      rom = rom.slice(0, -1);
    }
    return rom;
  }
  function romanizeDevanagariPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()\"'-]+)/);
    return tokens.map(applyDevanagariSchwaRules).join("");
  }

  // src/scripts/urdu.js
  var urduMap = {
    "\u0627": "a",
    "\u0628": "b",
    "\u067E": "p",
    "\u062A": "t",
    "\u0679": "t",
    "\u062B": "s",
    "\u062C": "j",
    "\u0686": "ch",
    "\u062D": "h",
    "\u062E": "kh",
    "\u062F": "d",
    "\u0688": "d",
    "\u0630": "z",
    "\u0631": "r",
    "\u0691": "r",
    "\u0632": "z",
    "\u0698": "zh",
    "\u0633": "s",
    "\u0634": "sh",
    "\u0635": "s",
    "\u0636": "z",
    "\u0637": "t",
    "\u0638": "z",
    "\u0639": "a",
    "\u063A": "gh",
    "\u0641": "f",
    "\u0642": "q",
    "\u06A9": "k",
    "\u06AF": "g",
    "\u0644": "l",
    "\u0645": "m",
    "\u0646": "n",
    "\u06BA": "n",
    "\u0648": "w",
    "\u06C1": "h",
    "\u06BE": "h",
    "\u06CC": "y",
    "\u06D2": "e",
    "\u0643": "k",
    "\u064A": "y",
    "\u0647": "h",
    "\u0622": "aa",
    "\u0626": "y",
    "\u0629": "t",
    "\u0623": "a",
    "\u0625": "i",
    "\u0624": "u",
    "\u0621": "'",
    "\u0671": "a",
    "\u0670": "a",
    "\u0649": "a",
    "\u064E": "a",
    "\u0650": "i",
    "\u064F": "u",
    "\u064B": "an",
    "\u064D": "in",
    "\u064C": "un"
  };
  var URDU_SUKUN = "\u0652";
  var URDU_SHADDA = "\u0651";
  var URDU_PHONETIC_DICT = {
    "\u06A9\u0646": "kun",
    "\u06A9\u064F\u0646": "kun",
    "\u0641\u06CC\u06A9\u0648\u0646": "fayakoon",
    "\u0641\u064E\u06CC\u06A9\u0648\u0646": "fayakoon",
    "\u0641\u064E\u064A\u064E\u0643\u064F\u0648\u0646": "fayakoon",
    "\u0641\u064A\u0643\u0646": "fayakun",
    "\u0635\u0644\u06CC": "Salla",
    "\u0635\u0644\u0651\u06CC": "Salla",
    "\u0635\u0644\u0651\u0649": "Salla",
    "\u0639\u0644\u06CC\u06C1": "Alayhi",
    "\u0648\u0633\u0644\u0645": "Wasallam",
    "\u0635\u062F\u0642": "Sadaqa",
    "\u0627\u0644\u0639\u0644\u06CC": "Al-Ali",
    "\u0627\u0644\u0639\u0638\u06CC\u0645": "Al-Azeem",
    "\u0631\u0633\u0648\u0644\u06C1": "Rasooluhu",
    "\u0627\u0644\u0646\u0628\u06CC": "An-Nabi",
    "\u0627\u0644\u06A9\u0631\u06CC\u0645": "Al-Kareem",
    "\u0631\u0633\u0648\u0644": "Rasool",
    "\u0646\u0628\u06CC": "Nabi",
    "\u06A9\u0631\u06CC\u0645": "Kareem",
    "\u0639\u0638\u06CC\u0645": "Azeem",
    "\u0639\u0644\u06CC": "Ali",
    "\u062D\u0642": "Haq",
    "\u06CC\u0627": "Ya",
    "\u06A9\u0627\u0644\u06CC\u0627\u06BA": "kaliyan",
    "\u0628\u0627\u0631\u06CC\u0627\u06BA": "bariyan",
    "\u06AF\u0688\u06CC\u0627\u06BA": "gadiyan",
    "\u0646\u0648\u06BA": "nu",
    "\u0644\u0627\u0648\u0627\u06BA": "lawan",
    "\u0633\u067E\u06CC\u0688": "speed",
    "\u0686\u0644\u0627\u06BA": "chalan",
    "\u067E\u0644\u0633": "police",
    "\u0633\u0627\u0645\u0646\u06D2": "samne",
    "\u0633\u0627\u0645\u0679\u06D2": "samne",
    "\u0646\u0626\u06CC\u06BA": "nai",
    "\u0631\u06A9\u062F\u0627": "rukda",
    "\u0631\u064F\u06A9\u062F\u0627": "rukda",
    "\u0628\u0631\u06CC\u06A9\u0627\u06BA": "breakan",
    "\u0679\u06CC\u0679\u0631": "tyre",
    "\u062F\u06CC": "di",
    "\u062F\u06D2": "de",
    "\u0686\u06CC\u062E": "cheekh",
    "\u06A9\u0688\u06BE\u062F\u0627": "kadhda",
    "\u0633\u0627\u0631\u06D2": "sare",
    "\u0644\u0648\u06A9\u06CC": "loki",
    "\u062A\u06A9\u062F\u06D2": "takde",
    "\u06A9\u06CC\u06C1\u06C1": "ki",
    "\u06AF\u06CC\u0627": "gaya",
    "\u0644\u06AF\u062F\u0627": "lagda",
    "\u0627\u0646\u062C": "anj",
    "\u0631\u06A9": "ruk",
    "\u062F\u0648": "do",
    "\u0633\u0648": "so",
    "\u0648\u06CC": "wi",
    "\u0627\u0644\u0644\u06C1": "Allah",
    "\u06C1\u06D2": "hai",
    "\u06C1\u06CC\u06BA": "hain",
    "\u0645\u06CC\u06BA": "mein",
    "\u062A\u06BE\u0627": "tha",
    "\u062A\u06BE\u06CC": "thi",
    "\u062A\u06BE\u06D2": "the",
    "\u06A9\u06CC": "ki",
    "\u06A9\u06D2": "ke",
    "\u06A9\u0627": "ka",
    "\u06A9\u0648": "ko",
    "\u06A9\u0631": "kar",
    "\u067E\u0631": "par",
    "\u0633\u06D2": "se",
    "\u062A\u0645": "tum",
    "\u06C1\u0645": "hum",
    "\u0648\u06C1": "woh",
    "\u06CC\u06C1": "yeh",
    "\u0627\u0648\u0631": "aur",
    "\u0646\u06C1\u06CC\u06BA": "nahin",
    "\u0646\u06C1": "na",
    "\u062A\u0648": "to",
    "\u062C\u0648": "jo",
    "\u06A9\u0648\u0626\u06CC": "koi",
    "\u0645\u06CC\u0631\u0627": "mera",
    "\u0645\u06CC\u0631\u06CC": "meri",
    "\u0645\u06CC\u0631\u06D2": "mere",
    "\u062A\u06CC\u0631\u0627": "tera",
    "\u062A\u06CC\u0631\u06CC": "teri",
    "\u062A\u06CC\u0631\u06D2": "tere",
    "\u06C1\u0648": "ho",
    "\u06C1\u0648\u0646\u0627": "hona",
    "\u06C1\u0648\u0627": "hua",
    "\u06C1\u0648\u0626\u06D2": "hue",
    "\u06C1\u0648\u0626\u06CC": "hui",
    "\u067E\u06CC\u0627\u0631": "pyar",
    "\u0645\u062D\u0628\u062A": "mohabbat",
    "\u0639\u0634\u0642": "ishq",
    "\u0632\u0646\u062F\u06AF\u06CC": "zindagi",
    "\u062F\u0644": "dil",
    "\u0635\u0646\u0645": "sanam",
    "\u06CC\u0627\u0631": "yaar",
    "\u062F\u0648\u0633\u062A": "dost",
    "\u062A\u0645\u06C1\u0627\u0631\u0627": "tumhara",
    "\u062A\u0645\u06C1\u0627\u0631\u06CC": "tumhari",
    "\u062A\u0645\u06C1\u0627\u0631\u06D2": "tumhare",
    "\u06C1\u0645\u0627\u0631\u0627": "hamara",
    "\u06C1\u0645\u0627\u0631\u06CC": "hamari",
    "\u06C1\u0645\u0627\u0631\u06D2": "hamare",
    "\u0627\u067E\u0646\u0627": "apna",
    "\u0627\u067E\u0646\u06CC": "apni",
    "\u0627\u067E\u0646\u06D2": "apne",
    "\u0627\u06CC\u06A9": "ek",
    "\u062A\u06CC\u0646": "teen"
  };

  // src/engine/urdu-phonetics.js
  function romanizeUrduPhonetic(text) {
    const normalized = text.replace(/ك/g, "\u06A9").replace(/ي/g, "\u06CC").replace(/ه/g, "\u06C1");
    const tokens = normalized.split(/([\s,،.?!:;()\"'-]+)/);
    return tokens.map((token) => {
      const cleanToken = token.replace(/[ًٌٍَُِّْ]/g, "");
      if (URDU_PHONETIC_DICT[cleanToken] !== void 0) return URDU_PHONETIC_DICT[cleanToken];
      if (/[؀-ۿ]/.test(token)) {
        return romanizeIndic(token, urduMap, null, { shadda: URDU_SHADDA, sukun: URDU_SUKUN });
      }
      return token;
    }).join("");
  }

  // src/scripts/tamil.js
  var tamilMap = {
    "\u0B85": "a",
    "\u0B86": "aa",
    "\u0B87": "i",
    "\u0B88": "ee",
    "\u0B89": "u",
    "\u0B8A": "oo",
    "\u0B8E": "e",
    "\u0B8F": "ae",
    "\u0B90": "ai",
    "\u0B92": "o",
    "\u0B93": "o",
    "\u0B94": "au",
    "\u0B95": "k",
    "\u0B99": "ng",
    "\u0B9A": "s",
    "\u0B9E": "ny",
    "\u0B9F": "d",
    "\u0BA3": "n",
    "\u0BA4": "th",
    "\u0BA8": "n",
    "\u0BAA": "p",
    "\u0BAE": "m",
    "\u0BAF": "y",
    "\u0BB0": "r",
    "\u0BB2": "l",
    "\u0BB5": "v",
    "\u0BB4": "zh",
    "\u0BB3": "l",
    "\u0BB1": "r",
    "\u0BA9": "n",
    "\u0B9C": "j",
    "\u0BB7": "sh",
    "\u0BB8": "s",
    "\u0BB9": "h",
    "\u0B9A\u0BCD\u0B9A": "ch",
    "\u0B9F\u0BCD\u0B9F": "tt",
    "\u0B9E\u0BCD\u0B9A": "nj",
    "\u0BAE\u0BCD\u0BAA": "mb",
    "\u0B99\u0BCD\u0B95": "ng",
    "\u0BBE": "aa",
    "\u0BBF": "i",
    "\u0BC0": "ee",
    "\u0BC1": "u",
    "\u0BC2": "oo",
    "\u0BC6": "e",
    "\u0BC7": "ae",
    "\u0BC8": "ai",
    "\u0BCA": "o",
    "\u0BCB": "o",
    "\u0BCC": "au"
  };
  var TAMIL_VIRAMA = "\u0BCD";
  var TAMIL_PHONETIC_DICT = {
    "\u0B87\u0BB2\u0BCD\u0BB2\u0BC8": "illai",
    "\u0B8E\u0BA9\u0BCD\u0BA9": "enna",
    "\u0BA8\u0BBE\u0BA9\u0BCD": "naan",
    "\u0BA8\u0BC0": "nee",
    "\u0B8E\u0BA9\u0B95\u0BCD\u0B95\u0BC1": "enakku",
    "\u0B89\u0BA9\u0B95\u0BCD\u0B95\u0BC1": "unakku",
    "\u0B95\u0BBE\u0BA4\u0BB2\u0BCD": "kaadhal",
    "\u0BA8\u0BC0\u0BAF\u0BC7": "neeyae"
  };

  // src/engine/tamil-phonetics.js
  function romanizeTamilPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
    return tokens.map((token) => {
      if (TAMIL_PHONETIC_DICT[token] !== void 0) return TAMIL_PHONETIC_DICT[token];
      if (/[\u0B80-\u0BFF]/.test(token)) {
        let rom = romanizeIndic(token, tamilMap, TAMIL_VIRAMA);
        rom = rom.replace(/([^td])du\b/g, "$1de");
        return rom;
      }
      return token;
    }).join("");
  }

  // src/scripts/telugu.js
  var teluguMap = {
    "\u0C05": "a",
    "\u0C06": "aa",
    "\u0C07": "i",
    "\u0C08": "ee",
    "\u0C09": "u",
    "\u0C0A": "oo",
    "\u0C0E": "e",
    "\u0C0F": "ae",
    "\u0C10": "ai",
    "\u0C12": "o",
    "\u0C13": "oo",
    "\u0C14": "au",
    "\u0C15": "k",
    "\u0C16": "kh",
    "\u0C17": "g",
    "\u0C18": "gh",
    "\u0C1A": "ch",
    "\u0C1B": "chh",
    "\u0C1C": "j",
    "\u0C1D": "jh",
    "\u0C1F": "t",
    "\u0C20": "th",
    "\u0C21": "d",
    "\u0C22": "dh",
    "\u0C23": "n",
    "\u0C24": "t",
    "\u0C25": "th",
    "\u0C26": "d",
    "\u0C27": "dh",
    "\u0C28": "n",
    "\u0C2A": "p",
    "\u0C2B": "ph",
    "\u0C2C": "b",
    "\u0C2D": "bh",
    "\u0C2E": "m",
    "\u0C2F": "y",
    "\u0C30": "r",
    "\u0C32": "l",
    "\u0C35": "v",
    "\u0C36": "sh",
    "\u0C37": "sh",
    "\u0C38": "s",
    "\u0C39": "h",
    "\u0C3E": "aa",
    "\u0C3F": "i",
    "\u0C40": "ee",
    "\u0C41": "u",
    "\u0C42": "oo",
    "\u0C46": "e",
    "\u0C47": "ae",
    "\u0C48": "ai",
    "\u0C4A": "o",
    "\u0C4B": "oo",
    "\u0C4C": "au",
    "\u0C02": "m",
    "\u0C03": "h"
  };
  var TELUGU_VIRAMA = "\u0C4D";
  var TELUGU_PHONETIC_DICT = {
    "\u0C39\u0C47": "hae",
    "\u0C28\u0C40": "nee",
    "\u0C05\u0C2F\u0C4D\u0C2F": "ayya",
    "\u0C1A\u0C46\u0C2F\u0C4D\u0C2F": "cheyya",
    "\u0C1C\u0C46\u0C2F\u0C4D\u0C2F": "jeyya",
    "\u0C1C\u0C02\u0C2C\u0C32\u0C3F\u0C15\u0C47": "jambalike",
    "\u0C1C\u0C02\u0C2C\u0C3E\u0C32\u0C3F\u0C15\u0C47": "jambaalike"
  };

  // src/engine/telugu-phonetics.js
  function romanizeTeluguPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
    return tokens.map((token) => {
      if (TELUGU_PHONETIC_DICT[token] !== void 0) return TELUGU_PHONETIC_DICT[token];
      if (/[\u0C00-\u0C7F]/.test(token)) return romanizeIndic(token, teluguMap, TELUGU_VIRAMA);
      return token;
    }).join("");
  }

  // src/engine/romanize.js
  function romanizeByScript(text, scriptId) {
    switch (scriptId) {
      case "devanagari":
        return romanizeDevanagariPhonetic(text);
      case "gurmukhi":
        return romanizeIndic(text, gurmukhiMap, GURMUKHI_VIRAMA, { addak: GURMUKHI_ADDAK });
      case "bengali":
        return romanizeIndic(text, bengaliMap, BENGALI_VIRAMA);
      case "gujarati":
        return romanizeIndic(text, gujaratiMap, GUJARATI_VIRAMA);
      case "odia":
        return romanizeIndic(text, odiaMap, ODIA_VIRAMA);
      case "tamil":
        return romanizeTamilPhonetic(text);
      case "telugu":
        return romanizeTeluguPhonetic(text);
      case "kannada":
        return romanizeIndic(text, kannadaMap, KANNADA_VIRAMA);
      case "malayalam":
        return romanizeIndic(text, malayalamMap, MALAYALAM_VIRAMA);
      case "urdu":
        return romanizeUrduPhonetic(text);
      default:
        return text;
    }
  }
  function detectScript(text) {
    const sample = [...text].slice(0, 50).join("");
    let bestId = null;
    let bestCount = 0;
    for (const s of SCRIPTS) {
      const matches = (sample.match(new RegExp(s.regex.source, "g")) || []).length;
      if (matches > bestCount) {
        bestCount = matches;
        bestId = s.id;
      }
    }
    return bestCount === 0 ? null : bestId;
  }
  function romanizeText(text) {
    if (!text) return text;
    const settings = state.settings;
    if (settings.autoDetect) {
      return text.split(/(\s+|[,،.?!:;()"'-]+)/).map((token) => {
        if (!/\S/.test(token) || !ANY_INDIAN.test(token)) return token;
        const detectedId = detectScript(token);
        return detectedId ? romanizeByScript(token, detectedId) : token;
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

  // src/cache.js
  var romanizeCache = /* @__PURE__ */ new Map();
  var MAX_CACHE_SIZE = 1e3;
  function romanizeTextCached(text) {
    if (!text) return text;
    if (romanizeCache.has(text)) return romanizeCache.get(text);
    const result = romanizeText(text);
    if (romanizeCache.size > MAX_CACHE_SIZE) {
      const firstKey = romanizeCache.keys().next().value;
      if (firstKey) romanizeCache.delete(firstKey);
    }
    romanizeCache.set(text, result);
    return result;
  }
  function clearRomanizeCache() {
    romanizeCache.clear();
  }

  // src/dom/lyrics.js
  var DEBOUNCE_MS = 300;
  var PLAYBACK_SCAN_INTERVAL_MS = 1e3;
  function processTextNode(node) {
    const current = node.nodeValue;
    if (!current) return;
    if (state.settings.enabled) {
      if (node._indianOrig) {
        const romanized = romanizeTextCached(node._indianOrig);
        if (current === node._indianOrig || current === romanized) {
          if (node.nodeValue !== romanized) node.nodeValue = romanized;
          return;
        }
        delete node._indianOrig;
      }
      if (ANY_INDIAN.test(current)) {
        node._indianOrig = current;
        const romanized = romanizeTextCached(current);
        if (node.nodeValue !== romanized) node.nodeValue = romanized;
      }
    } else if (node._indianOrig && node.nodeValue !== node._indianOrig) {
      node.nodeValue = node._indianOrig;
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
      "[data-testid*='lyric']"
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
      walkNode(document.querySelector("#main") || document.body);
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
    clearRomanizeCache();
    const container = getLyricsContainer();
    if (container) walkClearOrigCache(container);
    else {
      const main2 = document.querySelector("#main");
      if (main2) walkClearOrigCache(main2);
    }
  }
  function scheduleSafetyPass() {
    if (state.safetyPassTimer) clearTimeout(state.safetyPassTimer);
    state.safetyPassTimer = setTimeout(() => {
      state.safetyPassTimer = null;
      processLyrics();
    }, DEBOUNCE_MS);
  }
  function startObserver() {
    if (state.observer) return;
    state.observer = new MutationObserver((mutations) => {
      if (!state.settings.enabled) {
        scheduleSafetyPass();
        return;
      }
      let didWork = false;
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          processTextNode(mutation.target);
          didWork = true;
        } else if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            walkNode(node);
            didWork = true;
          }
        }
      }
      if (didWork) scheduleSafetyPass();
    });
    state.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function startPlaybackScan() {
    if (state.playbackScanInterval) return;
    state.playbackScanInterval = setInterval(() => {
      if (state.settings.enabled) processLyrics();
    }, PLAYBACK_SCAN_INTERVAL_MS);
  }
  function stopPlaybackScan() {
    if (state.playbackScanInterval) {
      clearInterval(state.playbackScanInterval);
      state.playbackScanInterval = null;
    }
  }

  // src/ui/panel.js
  function toggleRomanizer(nextState) {
    state.settings.enabled = typeof nextState === "boolean" ? nextState : !state.settings.enabled;
    saveSettings(state.settings);
    clearRomanizeCache();
    updateButtonIcon();
    const masterCb = document.getElementById("ir-master");
    if (masterCb) masterCb.checked = state.settings.enabled;
    processLyrics();
  }
  function extractLyricsText() {
    const container = getLyricsContainer();
    if (!container) return "";
    const lineNodes = container.querySelectorAll(
      "[data-testid='fullscreen-lyric'], [class*='lyrics-lyricsContent'] > div, [class*='lyric']"
    );
    if (lineNodes.length > 0) {
      const lines = [...lineNodes].map((n) => n.textContent?.trim()).filter(Boolean);
      if (lines.length > 0) return lines.join("\n");
    }
    return container.innerText || container.textContent || "";
  }
  function copyLyricsToClipboard() {
    const btn = document.getElementById("ir-copy-lyrics-btn");
    const text = extractLyricsText();
    if (!text) {
      if (btn) {
        const origHTML = btn.innerHTML;
        btn.innerHTML = "No lyrics found!";
        setTimeout(() => {
          if (btn) btn.innerHTML = origHTML;
        }, 2e3);
      }
      return;
    }
    const copyIconHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy Lyrics`;
    navigator.clipboard.writeText(text).then(() => {
      if (!btn) return;
      btn.innerHTML = "\u2713 Copied!";
      btn.style.color = "#1DB954";
      btn.style.borderColor = "#1DB954";
      setTimeout(() => {
        if (!btn) return;
        btn.innerHTML = copyIconHTML;
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 2e3);
    }).catch(() => {
      if (btn) btn.innerHTML = "Copy failed!";
    });
  }
  function outsideClickHandler(e) {
    const { panel, toggleBtn } = state;
    if (panel && !panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn?.contains(e.target)) {
      closePanel();
    }
  }
  function buildPanel() {
    injectStyles();
    const settings = state.settings;
    const el = document.createElement("div");
    el.id = "indian-romanizer-panel";
    el.innerHTML = `
        <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                <text x="50%" y="55%" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">\u0905</text>
            </svg>
            Indian Romanizer
        </h3>

        <div class="ir-row">
            <label for="ir-master">Romanization</label>
            <div class="ir-toggle">
                <input type="checkbox" id="ir-master" ${settings.enabled ? "checked" : ""}>
                <span class="ir-slider"></span>
            </div>
        </div>

        <hr class="ir-divider">

        <div class="ir-row">
            <label for="ir-autodetect">Auto-detect script</label>
            <input type="checkbox" class="ir-check" id="ir-autodetect" ${settings.autoDetect ? "checked" : ""}>
        </div>

        <hr class="ir-divider">

        <div class="ir-scripts-list" id="ir-script-list"></div>

        <hr class="ir-divider">

        <button id="ir-copy-lyrics-btn" class="ir-copy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Lyrics
        </button>
    `;
    const list = el.querySelector("#ir-script-list");
    SCRIPTS.forEach((s) => {
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
    el.querySelector("#ir-master").addEventListener("change", (e) => {
      toggleRomanizer(e.target.checked);
    });
    el.querySelector("#ir-autodetect").addEventListener("change", (e) => {
      settings.autoDetect = e.target.checked;
      saveSettings(settings);
      clearRomanizeCache();
      el.querySelectorAll(".ir-script-check").forEach((cb) => {
        cb.disabled = settings.autoDetect;
      });
      if (settings.enabled) processLyrics();
    });
    el.querySelectorAll(".ir-script-check").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        settings.scripts[e.target.dataset.id] = e.target.checked;
        saveSettings(settings);
        clearRomanizeCache();
        if (settings.enabled) processLyrics();
      });
    });
    el.querySelector("#ir-copy-lyrics-btn").addEventListener("click", copyLyricsToClipboard);
    document.body.appendChild(el);
    state.panel = el;
    setTimeout(() => {
      document.addEventListener("click", outsideClickHandler);
    }, 0);
  }
  function openPanel() {
    if (state.panel) {
      closePanel();
      return;
    }
    buildPanel();
  }
  function closePanel() {
    if (!state.panel) return;
    state.panel.remove();
    state.panel = null;
    document.removeEventListener("click", outsideClickHandler);
  }

  // src/ui/topbar.js
  var TOGGLE_SVG_ON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#1DB954">
        <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">\u0905</text>
    </svg>`;
  var TOGGLE_SVG_OFF = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" opacity="0.5">
        <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">\u0905</text>
    </svg>`;
  function updateButtonIcon() {
    if (state.toggleBtn) {
      state.toggleBtn.innerHTML = state.settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;
    }
  }
  function createToggleButton() {
    if (document.getElementById("ir-toggle-btn")) return;
    injectStyles();
    const btn = document.createElement("button");
    btn.id = "ir-toggle-btn";
    btn.className = "ir-topbar-button";
    btn.setAttribute("aria-label", "Toggle Indian Romanization");
    btn.innerHTML = state.settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPanel();
    };
    state.toggleBtn = btn;
    positionButton();
  }
  function positionButton() {
    const btn = state.toggleBtn;
    if (!btn) return;
    try {
      if (btn.isConnected) return;
      const rrBtn = document.querySelector("#rr-toggle-btn");
      if (rrBtn && rrBtn.parentElement) {
        rrBtn.parentElement.insertBefore(btn, rrBtn);
        return;
      }
      const rightBar = document.querySelector(".main-topBar-topbarContentRight") || document.querySelector('[class*="topBarContentRight"]');
      if (rightBar) {
        rightBar.insertBefore(btn, rightBar.firstChild);
        return;
      }
      const bell = document.querySelector('[data-testid="notification-indicator"]') || document.querySelector('button[aria-label="Notifications"]') || document.querySelector('button[aria-label*="Notification"]');
      if (bell) {
        const bellBtn = bell.closest("button") || bell;
        const container = bellBtn.parentElement;
        if (container?.className?.toString().toLowerCase().includes("right")) {
          container.insertBefore(btn, bellBtn);
          return;
        }
      }
      console.warn("[Indian Romanizer] Right topbar container not found yet, will retry...");
    } catch (err) {
      console.warn("[Indian Romanizer] Error positioning topbar button:", err);
    }
  }

  // src/index.js
  var BOOT_LYRICS_SCAN_DELAY_MS = 800;
  var SONGCHANGE_SCAN_DELAY_MS = 800;
  var SONGCHANGE_RESTART_DELAY_MS = 1e3;
  var READY_POLL_INTERVAL_MS = 200;
  var READY_POLL_MAX_ATTEMPTS = 30;
  function boot() {
    createToggleButton();
    startObserver();
    const topbarObserver = new MutationObserver(() => {
      if (!state.toggleBtn.isConnected) positionButton();
    });
    topbarObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("keydown", (e) => {
      if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        toggleRomanizer();
      }
    });
    startPlaybackScan();
    setTimeout(processLyrics, BOOT_LYRICS_SCAN_DELAY_MS);
  }
  function initWhenReady() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      const topbarReady = document.querySelector(".main-topBar-topbarContentRight") || document.querySelector('[class*="topBar-topbarContentRight"]') || document.querySelector('[data-testid="notification-indicator"]') || document.querySelector("header");
      if ((Spicetify?.Topbar || topbarReady) && document.body) {
        clearInterval(checkInterval);
        boot();
      } else if (attempts >= READY_POLL_MAX_ATTEMPTS) {
        clearInterval(checkInterval);
        boot();
      }
    }, READY_POLL_INTERVAL_MS);
  }
  function main() {
    state.settings = loadSettings();
    Spicetify.Player.addEventListener("songchange", () => {
      setTimeout(() => {
        clearLyricsOrigCache();
        if (state.settings.enabled) processLyrics();
      }, SONGCHANGE_SCAN_DELAY_MS);
      stopPlaybackScan();
      setTimeout(startPlaybackScan, SONGCHANGE_RESTART_DELAY_MS);
    });
    Spicetify.Player.addEventListener("onplaypause", () => {
      if (Spicetify.Player.isPlaying()) {
        startPlaybackScan();
      } else {
        stopPlaybackScan();
      }
    });
    initWhenReady();
  }
  function waitForSpicetify() {
    if (!Spicetify?.Player || !Spicetify?.Platform || !Spicetify?.Topbar) {
      setTimeout(waitForSpicetify, 300);
      return;
    }
    main();
  }
  waitForSpicetify();
})();
