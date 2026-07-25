import { romanizeText } from "./engine/romanize.js";

const romanizeCache = new Map();
const MAX_CACHE_SIZE = 1000;

export function romanizeTextCached(text) {
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

export function clearRomanizeCache() {
    romanizeCache.clear();
}
