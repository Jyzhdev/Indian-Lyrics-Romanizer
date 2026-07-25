import { devanagariMap, DEVANAGARI_VIRAMA, DEVANAGARI_PHONETIC_DICT } from "../scripts/devanagari.js";
import { romanizeIndic } from "./transliterate.js";

// Devanagari drops a lot of its written "a" sounds in natural speech
// (schwa deletion) - a plain letter-by-letter pass reads stiff without this.
// Known words go straight to the dictionary; anything else gets the two
// most common deletion patterns applied on top of the literal romanization.
export function applyDevanagariSchwaRules(word) {
    if (DEVANAGARI_PHONETIC_DICT[word] !== undefined) return DEVANAGARI_PHONETIC_DICT[word];
    if (!/[\u0900-\u097F]/.test(word)) return word;

    let rom = romanizeIndic(word, devanagariMap, DEVANAGARI_VIRAMA);

    // Penultimate schwa deletion: karataa -> karta, badalee -> badli
    rom = rom.replace(/([bcdfghjklmnpqrstvwxz])a([bcdfghjklmnpqrstvwxz]+)(aa|ee|oo|e|ai|o|au|i|u)/gi, "$1$2$3");

    // Word-final schwa deletion on multi-syllable words: bharata -> bharat
    if (rom.length > 3 && rom.endsWith("a") && !rom.endsWith("aa")) {
        rom = rom.slice(0, -1);
    }

    return rom;
}

export function romanizeDevanagariPhonetic(text) {
    const tokens = text.split(/([\s,،.?!:;()\"'-]+)/);
    return tokens.map(applyDevanagariSchwaRules).join("");
}
