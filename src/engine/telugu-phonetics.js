import { teluguMap, TELUGU_VIRAMA, TELUGU_PHONETIC_DICT } from "../scripts/telugu.js";
import { romanizeIndic } from "./transliterate.js";

export function romanizeTeluguPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
    return tokens.map(token => {
        if (TELUGU_PHONETIC_DICT[token] !== undefined) return TELUGU_PHONETIC_DICT[token];
        if (/[\u0C00-\u0C7F]/.test(token)) return romanizeIndic(token, teluguMap, TELUGU_VIRAMA);
        return token;
    }).join("");
}
