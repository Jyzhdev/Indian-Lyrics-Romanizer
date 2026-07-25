export const SCRIPTS = [
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

export const ANY_INDIAN = /[ऀ-ॿ਀-੿ঀ-৿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ؀-ۿ]/;
