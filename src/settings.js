import { SCRIPTS } from "./scripts/registry.js";

export const STORAGE_KEY = "indian-romanizer-settings";

export function defaultSettings() {
    const scripts = {};
    SCRIPTS.forEach(s => { scripts[s.id] = true; });
    return { enabled: true, autoDetect: true, scripts };
}

export function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultSettings();
        const saved = JSON.parse(raw);
        const def = defaultSettings();
        return {
            enabled: saved.enabled ?? def.enabled,
            autoDetect: saved.autoDetect ?? def.autoDetect,
            scripts: Object.assign({}, def.scripts, saved.scripts || {}),
        };
    } catch (_) {
        return defaultSettings();
    }
}

export function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
