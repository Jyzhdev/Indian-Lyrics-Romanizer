import { state } from "../state.js";
import { injectStyles } from "./styles.js";
import { openPanel } from "./panel.js";

const TOGGLE_SVG_ON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#1DB954">
        <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
    </svg>`;

const TOGGLE_SVG_OFF = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" opacity="0.5">
        <text x="50%" y="55%" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" dominant-baseline="middle" text-anchor="middle">अ</text>
    </svg>`;

export function updateButtonIcon() {
    if (state.toggleBtn) {
        state.toggleBtn.innerHTML = state.settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;
    }
}

export function createToggleButton() {
    if (document.getElementById("ir-toggle-btn")) return;
    injectStyles();

    const btn = document.createElement("button");
    btn.id = "ir-toggle-btn";
    btn.className = "ir-topbar-button";
    btn.setAttribute("aria-label", "Toggle Indian Romanization");
    btn.innerHTML = state.settings.enabled ? TOGGLE_SVG_ON : TOGGLE_SVG_OFF;
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPanel();
    };

    state.toggleBtn = btn;
    positionButton();
}

export function positionButton() {
    const btn = state.toggleBtn;
    if (!btn) return;

    try {
        if (btn.isConnected) return;

        // Prefer sitting directly left of the Russian Romanizer button, if installed
        const rrBtn = document.querySelector("#rr-toggle-btn");
        if (rrBtn && rrBtn.parentElement) {
            rrBtn.parentElement.insertBefore(btn, rrBtn);
            return;
        }

        const rightBar = document.querySelector(".main-topBar-topbarContentRight") ||
            document.querySelector('[class*="topBarContentRight"]');
        if (rightBar) {
            rightBar.insertBefore(btn, rightBar.firstChild);
            return;
        }

        // Fall back to the notification bell, but only if it's actually in the right-side bar
        const bell = document.querySelector('[data-testid="notification-indicator"]') ||
            document.querySelector('button[aria-label="Notifications"]') ||
            document.querySelector('button[aria-label*="Notification"]');
        if (bell) {
            const bellBtn = bell.closest("button") || bell;
            const container = bellBtn.parentElement;
            if (container?.className?.toString().toLowerCase().includes("right")) {
                container.insertBefore(btn, bellBtn);
                return;
            }
        }

        console.warn("[Indian Romanizer] Right topbar container not found yet, will retry...");
    } catch (err) {
        console.warn("[Indian Romanizer] Error positioning topbar button:", err);
    }
}
