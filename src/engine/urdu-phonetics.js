import { urduMap, URDU_SUKUN, URDU_SHADDA, URDU_PHONETIC_DICT } from "../scripts/urdu.js";
import { romanizeIndic } from "./transliterate.js";

export function romanizeUrduPhonetic(text) {
    // Arabic and Persian keyboards produce visually-identical variants of
    // the same letters (ك vs ک, ي vs ی, ه vs ہ) - normalize before lookup
    // so the dictionary doesn't need every variant listed separately.
    const normalized = text
        .replace(/ك/g, "ک")
        .replace(/ي/g, "ی")
        .replace(/ه/g, "ہ");

    const tokens = normalized.split(/([\s,،.?!:;()\"'-]+)/);

    return tokens.map(token => {
        const cleanToken = token.replace(/[ًٌٍَُِّْ]/g, "");
        if (URDU_PHONETIC_DICT[cleanToken] !== undefined) return URDU_PHONETIC_DICT[cleanToken];
        if (/[؀-ۿ]/.test(token)) {
            return romanizeIndic(token, urduMap, null, { shadda: URDU_SHADDA, sukun: URDU_SUKUN });
        }
        return token;
    }).join("");
}
