import { ANY_INDIAN } from "../scripts/registry.js";
import { state } from "../state.js";
import { romanizeTextCached, clearRomanizeCache } from "../cache.js";

const DEBOUNCE_MS = 300;
const PLAYBACK_SCAN_INTERVAL_MS = 1000;

export function processTextNode(node) {
    const current = node.nodeValue;
    if (!current) return;

    if (state.settings.enabled) {
        if (node._indianOrig) {
            const romanized = romanizeTextCached(node._indianOrig);
            // Text still matches what we expect - apply or keep the romanized form
            if (current === node._indianOrig || current === romanized) {
                if (node.nodeValue !== romanized) node.nodeValue = romanized;
                return;
            }
            // Text doesn't match either - Spotify recycled this node for a
            // different lyric line. Drop the stale original and re-detect below.
            delete node._indianOrig;
        }

        if (ANY_INDIAN.test(current)) {
            node._indianOrig = current;
            const romanized = romanizeTextCached(current);
            if (node.nodeValue !== romanized) node.nodeValue = romanized;
        }
        // No Indian chars and no stored original: plain English, leave it alone.
    } else if (node._indianOrig && node.nodeValue !== node._indianOrig) {
        node.nodeValue = node._indianOrig;
    }
}

export function walkNode(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
        return;
    }
    if (node.shadowRoot) walkNode(node.shadowRoot);
    for (let c = node.firstChild; c; c = c.nextSibling) walkNode(c);
}

export function getLyricsContainer() {
    const selectors = [
        "[data-testid='fullscreen-lyric']",
        "[class*='lyrics-lyricsContent']",
        "[class*='lyric']",
        "[data-testid*='lyric']",
    ];
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.parentElement || el;
    }
    return null;
}

export function processLyrics() {
    const container = getLyricsContainer();
    if (container) {
        walkNode(container);
    } else {
        walkNode(document.querySelector("#main") || document.body);
    }
}

function walkClearOrigCache(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
        delete node._indianOrig;
        return;
    }
    if (node.shadowRoot) walkClearOrigCache(node.shadowRoot);
    for (let c = node.firstChild; c; c = c.nextSibling) walkClearOrigCache(c);
}

export function clearLyricsOrigCache() {
    clearRomanizeCache();
    const container = getLyricsContainer();
    if (container) walkClearOrigCache(container);
    else {
        const main = document.querySelector("#main");
        if (main) walkClearOrigCache(main);
    }
}

function scheduleSafetyPass() {
    if (state.safetyPassTimer) clearTimeout(state.safetyPassTimer);
    state.safetyPassTimer = setTimeout(() => {
        state.safetyPassTimer = null;
        processLyrics();
    }, DEBOUNCE_MS);
}

// Spotify's lyrics panel is virtualized - the container element itself can
// get unmounted and replaced as the active line changes, not just have its
// text edited. A MutationObserver only reports changes happening INSIDE the
// node it's watching, never that node's own removal by its parent - so
// watching the lyrics container directly means missing exactly that swap
// and going silent for good. Watching document.body means every such swap
// shows up as an ordinary childList mutation no matter how deep it happens.
// processLyrics() still only walks the small lyrics container on a full
// pass, so this doesn't cost more work - it just guarantees we hear about
// changes at all. (Learned this one the hard way - don't retarget to
// getLyricsContainer() here, it silently breaks line-transition detection.)
export function startObserver() {
    if (state.observer) return;

    state.observer = new MutationObserver((mutations) => {
        if (!state.settings.enabled) {
            scheduleSafetyPass();
            return;
        }

        let didWork = false;
        for (const mutation of mutations) {
            if (mutation.type === "characterData") {
                processTextNode(mutation.target);
                didWork = true;
            } else if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                    walkNode(node);
                    didWork = true;
                }
            }
        }

        // Debounced full pass to catch anything the per-mutation handling above missed
        if (didWork) scheduleSafetyPass();
    });

    state.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// Last-resort net for anything the observer misses (shadow DOM, iframes, etc.)
export function startPlaybackScan() {
    if (state.playbackScanInterval) return;
    state.playbackScanInterval = setInterval(() => {
        if (state.settings.enabled) processLyrics();
    }, PLAYBACK_SCAN_INTERVAL_MS);
}

export function stopPlaybackScan() {
    if (state.playbackScanInterval) {
        clearInterval(state.playbackScanInterval);
        state.playbackScanInterval = null;
    }
}
