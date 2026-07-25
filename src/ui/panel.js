import { SCRIPTS } from "../scripts/registry.js";
import { state } from "../state.js";
import { saveSettings } from "../settings.js";
import { clearRomanizeCache } from "../cache.js";
import { processLyrics, getLyricsContainer } from "../dom/lyrics.js";
import { injectStyles } from "./styles.js";
import { updateButtonIcon } from "./topbar.js";

export function toggleRomanizer(nextState) {
    state.settings.enabled = typeof nextState === "boolean" ? nextState : !state.settings.enabled;
    saveSettings(state.settings);
    clearRomanizeCache();
    updateButtonIcon();

    const masterCb = document.getElementById("ir-master");
    if (masterCb) masterCb.checked = state.settings.enabled;

    processLyrics();
}

function extractLyricsText() {
    const container = getLyricsContainer();
    if (!container) return "";

    const lineNodes = container.querySelectorAll(
        "[data-testid='fullscreen-lyric'], [class*='lyrics-lyricsContent'] > div, [class*='lyric']"
    );
    if (lineNodes.length > 0) {
        const lines = [...lineNodes].map(n => n.textContent?.trim()).filter(Boolean);
        if (lines.length > 0) return lines.join("\n");
    }

    return container.innerText || container.textContent || "";
}

function copyLyricsToClipboard() {
    const btn = document.getElementById("ir-copy-lyrics-btn");
    const text = extractLyricsText();

    if (!text) {
        if (btn) {
            const origHTML = btn.innerHTML;
            btn.innerHTML = "No lyrics found!";
            setTimeout(() => { if (btn) btn.innerHTML = origHTML; }, 2000);
        }
        return;
    }

    const copyIconHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy Lyrics`;

    navigator.clipboard.writeText(text).then(() => {
        if (!btn) return;
        btn.innerHTML = "✓ Copied!";
        btn.style.color = "#1DB954";
        btn.style.borderColor = "#1DB954";
        setTimeout(() => {
            if (!btn) return;
            btn.innerHTML = copyIconHTML;
            btn.style.color = "";
            btn.style.borderColor = "";
        }, 2000);
    }).catch(() => {
        if (btn) btn.innerHTML = "Copy failed!";
    });
}

function outsideClickHandler(e) {
    const { panel, toggleBtn } = state;
    if (panel && !panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn?.contains(e.target)) {
        closePanel();
    }
}

function buildPanel() {
    injectStyles();
    const settings = state.settings;

    const el = document.createElement("div");
    el.id = "indian-romanizer-panel";
    el.innerHTML = `
        <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                <text x="50%" y="55%" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
            </svg>
            Indian Romanizer
        </h3>

        <div class="ir-row">
            <label for="ir-master">Romanization</label>
            <div class="ir-toggle">
                <input type="checkbox" id="ir-master" ${settings.enabled ? "checked" : ""}>
                <span class="ir-slider"></span>
            </div>
        </div>

        <hr class="ir-divider">

        <div class="ir-row">
            <label for="ir-autodetect">Auto-detect script</label>
            <input type="checkbox" class="ir-check" id="ir-autodetect" ${settings.autoDetect ? "checked" : ""}>
        </div>

        <hr class="ir-divider">

        <div class="ir-scripts-list" id="ir-script-list"></div>

        <hr class="ir-divider">

        <button id="ir-copy-lyrics-btn" class="ir-copy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Lyrics
        </button>
    `;

    const list = el.querySelector("#ir-script-list");
    SCRIPTS.forEach(s => {
        const row = document.createElement("div");
        row.className = "ir-row";
        const checked = settings.scripts[s.id] ? "checked" : "";
        const disabled = settings.autoDetect ? "disabled" : "";
        row.innerHTML = `
            <label for="ir-script-${s.id}">${s.label}</label>
            <input type="checkbox" class="ir-check ir-script-check"
                   id="ir-script-${s.id}" data-id="${s.id}" ${checked} ${disabled}>
        `;
        list.appendChild(row);
    });

    el.querySelector("#ir-master").addEventListener("change", e => {
        toggleRomanizer(e.target.checked);
    });

    el.querySelector("#ir-autodetect").addEventListener("change", e => {
        settings.autoDetect = e.target.checked;
        saveSettings(settings);
        clearRomanizeCache();

        el.querySelectorAll(".ir-script-check").forEach(cb => {
            cb.disabled = settings.autoDetect;
        });
        if (settings.enabled) processLyrics();
    });

    el.querySelectorAll(".ir-script-check").forEach(cb => {
        cb.addEventListener("change", e => {
            settings.scripts[e.target.dataset.id] = e.target.checked;
            saveSettings(settings);
            clearRomanizeCache();
            if (settings.enabled) processLyrics();
        });
    });

    el.querySelector("#ir-copy-lyrics-btn").addEventListener("click", copyLyricsToClipboard);

    document.body.appendChild(el);
    state.panel = el;

    setTimeout(() => {
        document.addEventListener("click", outsideClickHandler);
    }, 0);
}

export function openPanel() {
    if (state.panel) {
        closePanel();
        return;
    }
    buildPanel();
}

export function closePanel() {
    if (!state.panel) return;
    state.panel.remove();
    state.panel = null;
    document.removeEventListener("click", outsideClickHandler);
}
