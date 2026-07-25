import { SCRIPTS, ANY_INDIAN } from "../scripts/registry.js";
import { gurmukhiMap, GURMUKHI_VIRAMA, GURMUKHI_ADDAK } from "../scripts/gurmukhi.js";
import { bengaliMap, BENGALI_VIRAMA } from "../scripts/bengali.js";
import { gujaratiMap, GUJARATI_VIRAMA } from "../scripts/gujarati.js";
import { odiaMap, ODIA_VIRAMA } from "../scripts/odia.js";
import { kannadaMap, KANNADA_VIRAMA } from "../scripts/kannada.js";
import { malayalamMap, MALAYALAM_VIRAMA } from "../scripts/malayalam.js";
import { romanizeIndic } from "./transliterate.js";
import { romanizeDevanagariPhonetic } from "./devanagari-phonetics.js";
import { romanizeUrduPhonetic } from "./urdu-phonetics.js";
import { romanizeTamilPhonetic } from "./tamil-phonetics.js";
import { romanizeTeluguPhonetic } from "./telugu-phonetics.js";
import { state } from "../state.js";

export function romanizeByScript(text, scriptId) {
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

export function detectScript(text) {
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

export function romanizeText(text) {
    if (!text) return text;
    const settings = state.settings;

    if (settings.autoDetect) {
        return text.split(/(\s+|[,،.?!:;()"'-]+)/).map(token => {
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
