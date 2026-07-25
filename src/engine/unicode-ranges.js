// Codepoint ranges pulled straight from the Unicode blocks for each script.
// Consonants need this to decide whether to add the implicit "a" sound;
// matras (vowel signs) need it to know when NOT to add that "a".

export function isIndicConsonant(char) {
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

export function isIndicMatra(char) {
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
