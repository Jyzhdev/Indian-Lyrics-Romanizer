import { state } from "./state.js";
import { loadSettings } from "./settings.js";
import { createToggleButton, positionButton } from "./ui/topbar.js";
import { toggleRomanizer } from "./ui/panel.js";
import {
    processLyrics,
    clearLyricsOrigCache,
    startObserver,
    startPlaybackScan,
    stopPlaybackScan,
} from "./dom/lyrics.js";

const BOOT_LYRICS_SCAN_DELAY_MS = 800;
const SONGCHANGE_SCAN_DELAY_MS = 800;
const SONGCHANGE_RESTART_DELAY_MS = 1000;
const READY_POLL_INTERVAL_MS = 200;
const READY_POLL_MAX_ATTEMPTS = 30;

function boot() {
    createToggleButton();
    startObserver();

    // Only re-position our button when it actually falls out of the DOM
    const topbarObserver = new MutationObserver(() => {
        if (!state.toggleBtn.isConnected) positionButton();
    });
    topbarObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("keydown", (e) => {
        if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && (e.key === "r" || e.key === "R")) {
            e.preventDefault();
            toggleRomanizer();
        }
    });

    startPlaybackScan();
    setTimeout(processLyrics, BOOT_LYRICS_SCAN_DELAY_MS);
}

function initWhenReady() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        const topbarReady = document.querySelector(".main-topBar-topbarContentRight") ||
            document.querySelector('[class*="topBar-topbarContentRight"]') ||
            document.querySelector('[data-testid="notification-indicator"]') ||
            document.querySelector("header");

        if ((Spicetify?.Topbar || topbarReady) && document.body) {
            clearInterval(checkInterval);
            boot();
        } else if (attempts >= READY_POLL_MAX_ATTEMPTS) {
            clearInterval(checkInterval);
            boot();
        }
    }, READY_POLL_INTERVAL_MS);
}

function main() {
    state.settings = loadSettings();

    Spicetify.Player.addEventListener("songchange", () => {
        setTimeout(() => {
            clearLyricsOrigCache();
            if (state.settings.enabled) processLyrics();
        }, SONGCHANGE_SCAN_DELAY_MS);

        stopPlaybackScan();
        setTimeout(startPlaybackScan, SONGCHANGE_RESTART_DELAY_MS);
    });

    Spicetify.Player.addEventListener("onplaypause", () => {
        if (Spicetify.Player.isPlaying()) {
            startPlaybackScan();
        } else {
            stopPlaybackScan();
        }
    });

    initWhenReady();
}

function waitForSpicetify() {
    if (!Spicetify?.Player || !Spicetify?.Platform || !Spicetify?.Topbar) {
        setTimeout(waitForSpicetify, 300);
        return;
    }
    main();
}

waitForSpicetify();
