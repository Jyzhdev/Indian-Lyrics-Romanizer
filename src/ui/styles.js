export function injectStyles() {
    if (document.getElementById("indian-romanizer-styles")) return;

    const style = document.createElement("style");
    style.id = "indian-romanizer-styles";
    style.textContent = `
        .main-topBar-topbarContentRight {
            display: flex !important;
            align-items: center !important;
            flex-shrink: 0 !important;
            min-width: max-content !important;
        }

        #ir-toggle-btn {
            display: flex !important; align-items: center !important; justify-content: center !important;
            width: 32px !important; height: 32px !important; background: transparent !important;
            border: none !important; border-radius: 50% !important; margin-right: 8px !important;
            color: white !important; cursor: pointer !important;
            transition: background 0.2s ease, transform 0.1s ease !important;
            -webkit-app-region: no-drag !important; z-index: 99 !important;
        }
        #ir-toggle-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
        #ir-toggle-btn:active { transform: scale(0.9); }
        #ir-toggle-btn svg { pointer-events: none !important; }

        #indian-romanizer-panel {
            position: fixed;
            top: 60px;
            right: 16px;
            z-index: 9999;
            background: rgba(24, 24, 24, 0.88);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 16px 20px;
            min-width: 250px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
            font-family: "Circular Std", "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: #fff;
            font-size: 13px;
            user-select: none;
            animation: ir-fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes ir-fade-in {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        #indian-romanizer-panel h3 {
            margin: 0 0 14px;
            font-size: 15px;
            font-weight: 700;
            background: linear-gradient(90deg, #1db954, #1ed760);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: .5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ir-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 8px;
            margin: 0 -8px 4px;
            border-radius: 6px;
            transition: background 0.2s ease;
        }
        .ir-row:hover:not(.ir-header-row) {
            background: rgba(255, 255, 255, 0.04);
        }
        .ir-row label {
            cursor: pointer;
            flex: 1;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 500;
            transition: color 0.2s ease;
        }
        .ir-row:hover label {
            color: #ffffff;
        }
        .ir-row label:not([for]) {
            pointer-events: none;
        }
        .ir-divider {
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin: 12px -8px;
        }
        .ir-toggle {
            position: relative;
            width: 40px !important;
            height: 22px !important;
            flex: none !important;
            cursor: pointer;
        }
        .ir-toggle input {
            position: absolute;
            inset: 0;
            opacity: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            cursor: pointer;
            z-index: 2;
        }
        .ir-slider {
            position: absolute;
            inset: 0;
            background: #444;
            border-radius: 22px;
            transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
        }
        .ir-slider::before {
            content: "";
            position: absolute;
            width: 16px; height: 16px;
            left: 3px; top: 3px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        .ir-toggle input:checked + .ir-slider { background: #1DB954; }
        .ir-toggle input:checked + .ir-slider::before { transform: translateX(18px); }

        .ir-check {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            background: transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            flex-shrink: 0;
            margin-left: 8px;
        }
        .ir-check:hover:not(:disabled) {
            border-color: #1ed760;
            background: rgba(29, 185, 84, 0.08);
        }
        .ir-check:checked {
            background: #1DB954;
            border-color: #1DB954;
        }
        .ir-check:checked::after {
            content: "";
            position: absolute;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            top: 2px;
            left: 5px;
        }
        .ir-check:disabled {
            opacity: 0.25;
            cursor: not-allowed;
            border-color: rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
        }
        .ir-check:active:not(:disabled) {
            transform: scale(0.9);
        }
        .ir-scripts-list {
            max-height: 220px;
            overflow-y: auto;
            padding-right: 4px;
        }
        .ir-scripts-list::-webkit-scrollbar { width: 4px; }
        .ir-scripts-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }
        .ir-scripts-list::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

        .ir-copy-btn {
            width: 100%;
            margin-top: 12px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
        }
        .ir-copy-btn:hover {
            background: rgba(29, 185, 84, 0.15);
            border-color: #1DB954;
            color: #1DB954;
        }
        .ir-copy-btn:active {
            transform: scale(0.97);
        }
    `;
    document.head.appendChild(style);
}
