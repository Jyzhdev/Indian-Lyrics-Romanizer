import { tamilMap, TAMIL_VIRAMA, TAMIL_PHONETIC_DICT } from "../scripts/tamil.js";
import { romanizeIndic } from "./transliterate.js";

export function romanizeTamilPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()"'-]+)/);
    return tokens.map(token => {
        if (TAMIL_PHONETIC_DICT[token] !== undefined) return TAMIL_PHONETIC_DICT[token];
        if (/[\u0B80-\u0BFF]/.test(token)) {
            let rom = romanizeIndic(token, tamilMap, TAMIL_VIRAMA);
            // "du" at a word ending reads more naturally as "de" in Tamil
            rom = rom.replace(/([^td])du\b/g, "$1de");
            return rom;
        }
        return token;
    }).join("");
}
