import { isIndicConsonant, isIndicMatra } from "./unicode-ranges.js";

// Nukta marks (the little dot under a consonant that changes its sound,
// e.g. क + ़ = क़) shouldn't count as "something after the consonant" when
// we're deciding whether to add the implicit "a" - we peek past them.
const NUKTA_CHARS = new Set(["\u093C", "\u0A3C", "\u09BC"]);

export function romanizeIndic(text, map, virama, extraOpts = {}) {
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
            // Double the last consonant cluster (shadda = gemination mark)
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
                while (peekIdx < chars.length && (NUKTA_CHARS.has(chars[peekIdx]) || (addak && chars[peekIdx] === addak))) {
                    peekIdx++;
                    nextC = chars[peekIdx];
                }

                const nextIsMatra = nextC && isIndicMatra(nextC);
                const nextIsVirama = nextC === virama;
                const nextIsEndOfWord = !nextC || /[\s\p{P}]/u.test(nextC);

                // Bare consonant with nothing overriding it gets the implicit "a"
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
